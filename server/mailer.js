// Confirmation emails via Gmail SMTP (Nodemailer).
// Needs a Gmail account with 2-Step Verification and an App Password.
// NOTE: Render's free tier blocks outbound SMTP (ports 465/587); this works locally and on paid instances.
const nodemailer = require("nodemailer");

function isConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""), // Google shows it as "abcd efgh ijkl mnop"
      },
      // Fail fast when the port is blocked instead of hanging for minutes.
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function sendApplicationConfirmation({ to, name, roleTitle }) {
  const fromName = process.env.MAIL_FROM_NAME || "Elen Engineering Careers";
  const text =
    `Dear ${name},\n\n` +
    `Thank you for applying for the ${roleTitle} position at Elen Engineering. We have received your application.\n\n` +
    `Our recruitment team will review it and contact you if your profile matches the requirements.\n\n` +
    `This is an automated confirmation, so there is no need to reply.\n\n` +
    `Regards,\nElen Engineering Recruitment Team`;
  const html =
    `<p>Dear ${esc(name)},</p>` +
    `<p>Thank you for applying for the <strong>${esc(roleTitle)}</strong> position at Elen Engineering. We have received your application.</p>` +
    `<p>Our recruitment team will review it and contact you if your profile matches the requirements.</p>` +
    `<p style="color:#666;font-size:12px">This is an automated confirmation, so there is no need to reply.</p>` +
    `<p>Regards,<br>Elen Engineering Recruitment Team</p>`;

  return getTransporter().sendMail({
    from: `"${fromName.replace(/"/g, "")}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `We received your application: ${roleTitle}`.replace(/[\r\n]+/g, " "),
    text,
    html,
  });
}

module.exports = { isConfigured, sendApplicationConfirmation };
