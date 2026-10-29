import { onValueCreated } from 'firebase-functions/v2/database';
import { defineBoolean, defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import nodemailer from 'nodemailer';

initializeApp();

// ---- Configuration: lives only on the server (never in public/) -------------------------
const HR_EMAIL = defineString('HR_EMAIL');
const MAIL_FROM = defineString('MAIL_FROM');
const SMTP_HOST = defineString('SMTP_HOST');
const SMTP_PORT = defineString('SMTP_PORT', { default: '587' });
const SMTP_USER = defineString('SMTP_USER');
const SMTP_PASS = defineSecret('SMTP_PASS');
const SEND_AUTOREPLY = defineBoolean('SEND_AUTOREPLY', { default: false });

/** Must match the Realtime Database region (it cannot be changed after creation). */
const REGION = 'asia-southeast1';
const MAX_EMAILS_PER_HOUR = 60;
const CV_LINK_TTL_MS = 7 * 24 * 3600 * 1000 - 60_000; // v4 signed URLs max out at 7 days

interface Application {
  uid?: string;
  jobId?: string;
  jobTitle?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  cvPath?: string;
  emailSent?: boolean;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const escapeHtml = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Header values must never contain line breaks (header injection). */
const oneLine = (v: unknown): string => String(v ?? '').replace(/[\r\n\u2028\u2029]+/g, ' ').trim();

/** Re-validate on the server: the function must not trust that the rules were the only door in. */
function isValid(a: Application): a is Required<Pick<Application, 'uid' | 'name' | 'email' | 'cvPath'>> & Application {
  return (
    typeof a.uid === 'string' &&
    typeof a.name === 'string' && a.name.trim().length >= 2 && a.name.length <= 100 &&
    typeof a.email === 'string' && EMAIL_RE.test(a.email) && a.email.length <= 254 &&
    typeof a.cvPath === 'string' && a.cvPath.startsWith(`cvs/${a.uid}/`)
  );
}

function transport() {
  const port = Number(SMTP_PORT.value());
  return nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port,
    secure: port === 465,
    auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
  });
}

export const onApplicationCreated = onValueCreated(
  {
    ref: '/applications/{appId}',
    region: REGION,
    secrets: [SMTP_PASS],
    retry: true,
  },
  async (event) => {
    const snap = event.data;
    const appId = event.params.appId;
    const app = snap.val() as Application | null;

    if (!app) return;
    if (app.emailSent) return; // idempotency: retries must not send twice

    if (!isValid(app)) {
      logger.warn('Ignoring application that failed server-side validation', { appId });
      return;
    }

    // Hourly cap so a flood of writes cannot turn into a flood of email.
    const hourKey = new Date().toISOString().slice(0, 13).replace(/\D/g, '');
    const counter = await snap.ref.root.child(`_meta/emailCounter/${hourKey}`).transaction((n: number | null) => (n ?? 0) + 1);
    if ((counter.snapshot.val() as number) > MAX_EMAILS_PER_HOUR) {
      logger.error('Hourly email cap reached; application stored but not emailed', { appId });
      return;
    }

    const [cvUrl] = await getStorage()
      .bucket()
      .file(app.cvPath)
      .getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + CV_LINK_TTL_MS });

    const name = oneLine(app.name);
    const email = oneLine(app.email);
    const jobTitle = oneLine(app.jobTitle) || 'General application';
    const phone = oneLine(app.phone);
    const note = String(app.message ?? '').trim();

    const text = [
      `New application: ${jobTitle}`,
      '',
      `Name:  ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || '-'}`,
      '',
      'Cover note:',
      note || '-',
      '',
      `CV (link valid for 7 days): ${cvUrl}`,
      `Reference: ${appId}`,
    ].join('\n');

    const row = (k: string, v: string) =>
      `<tr><td style="padding:4px 14px 4px 0;color:#526170"><b>${k}</b></td><td style="padding:4px 0">${v}</td></tr>`;
    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#102238;max-width:620px">
        <h2 style="margin:0 0 12px;color:#073b70">New application: ${escapeHtml(jobTitle)}</h2>
        <table style="border-collapse:collapse">
          ${row('Name', escapeHtml(name))}
          ${row('Email', `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`)}
          ${row('Phone', escapeHtml(phone) || '-')}
          ${row('Reference', escapeHtml(appId))}
        </table>
        <p style="margin:16px 0 4px"><b>Cover note</b></p>
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(note) || '-'}</p>
        <p style="margin:18px 0">
          <a href="${escapeHtml(cvUrl)}" style="background:#075da4;color:#fff;padding:10px 18px;border-radius:20px;text-decoration:none">Download CV</a>
          <span style="color:#526170;font-size:12px"> link expires in 7 days</span>
        </p>
      </div>`;

    const mailer = transport();

    await mailer.sendMail({
      from: MAIL_FROM.value(),
      to: HR_EMAIL.value(),
      replyTo: { name, address: email }, // HR can just hit Reply
      subject: `New application: ${jobTitle} — ${name}`,
      text,
      html,
    });

    // Mark as sent before the optional extra email, so a failure there cannot cause a duplicate to HR.
    await snap.ref.update({ emailSent: true });

    if (SEND_AUTOREPLY.value()) {
      try {
        await mailer.sendMail({
          from: MAIL_FROM.value(),
          to: email,
          subject: `We received your application: ${jobTitle}`,
          text: `Hi ${name},\n\nThanks for applying for ${jobTitle} at ELEN Engineering. We have received your application and the recruitment team will be in touch if your profile is a match.\n\nReference: ${appId}\n\nELEN Engineering`,
        });
      } catch (err) {
        logger.warn('Auto-reply failed (HR email already sent)', { appId, err });
      }
    }

    logger.info('Application email sent', { appId, jobId: app.jobId });
  },
);
