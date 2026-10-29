import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  friendlyError,
  GENERAL_JOB_ID,
  GENERAL_JOB_TITLE,
  submitApplication,
} from '../lib/applications';
import {
  CV_ACCEPT,
  FIELD_ORDER,
  formatBytes,
  MAX_MESSAGE,
  validateApplication,
  type FieldKey,
  type FormErrors,
  type FormValues,
} from '../lib/validation';
import type { Job } from '../types';
import { Modal } from './Modal';

/** A human cannot fill in this form and pick a file in under ~3 seconds. */
const MIN_FILL_MS = 3000;
const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL;

type Status = 'idle' | 'submitting' | 'done';

interface FieldProps {
  name: FieldKey;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (a: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode;
}

const fieldId = (name: FieldKey) => `ap-${name}`;

function Field({ name, label, required, error, hint, children }: FieldProps) {
  const id = fieldId(name);
  const describedBy = [error ? `${id}-err` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="req" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {hint && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  /** null = general application */
  job: Job | null;
  onClose: () => void;
}

export function ApplyModal({ job, onClose }: Props) {
  const [values, setValues] = useState<FormValues>({ name: '', email: '', phone: '', message: '' });
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [refId, setRefId] = useState('');
  const openedAt = useRef(Date.now());

  const roleTitle = job ? job.title : GENERAL_JOB_TITLE;
  const busy = status === 'submitting';

  const set = (key: keyof FormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    if (errors.cv) setErrors((er) => ({ ...er, cv: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    const found = validateApplication(values, file, consent);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((k) => found[k]);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    if (!file) return;

    // Bots: pretend it worked, send nothing.
    if (website || Date.now() - openedAt.current < MIN_FILL_MS) {
      setRefId('—');
      setStatus('done');
      return;
    }

    setSubmitError('');
    setProgress(0);
    setStatus('submitting');
    try {
      const id = await submitApplication(
        {
          ...values,
          jobId: job ? job.id : GENERAL_JOB_ID,
          jobTitle: roleTitle,
          file,
        },
        setProgress,
      );
      setRefId(id);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setSubmitError(friendlyError(err));
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <Modal key="done" labelledBy="apply-title" onClose={onClose}>
        <h2 id="apply-title">Application sent</h2>
        <div className="banner ok" role="status">
          Thank you, {values.name.trim().split(/\s+/)[0] || 'candidate'}. Your application for{' '}
          <b>{roleTitle}</b> has been sent to the recruitment team.
        </div>
        <p>
          Your reference ID: <span className="ref-id">{refId}</span>
        </p>
        <p className="hint">Keep this ID if you need to contact us about your application.</p>
        <button type="button" className="btn primary" onClick={onClose}>
          Close
        </button>
      </Modal>
    );
  }

  return (
    <Modal key="form" labelledBy="apply-title" onClose={onClose} dismissible={!busy} wide>
      <span className="tag">Application</span>
      <h2 id="apply-title">Apply: {roleTitle}</h2>

      <form className="apply-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="ap-role">Role</label>
          <input id="ap-role" type="text" value={roleTitle} readOnly />
        </div>

        <div className="field-row">
          <Field name="name" label="Full name" required error={errors.name}>
            {(a) => (
              <input
                {...a}
                type="text"
                autoComplete="name"
                maxLength={100}
                value={values.name}
                onChange={set('name')}
                disabled={busy}
              />
            )}
          </Field>
          <Field name="email" label="Email" required error={errors.email}>
            {(a) => (
              <input
                {...a}
                type="email"
                autoComplete="email"
                maxLength={254}
                value={values.email}
                onChange={set('email')}
                disabled={busy}
              />
            )}
          </Field>
        </div>

        <Field name="phone" label="Phone" error={errors.phone}>
          {(a) => (
            <input
              {...a}
              type="tel"
              autoComplete="tel"
              maxLength={20}
              value={values.phone}
              onChange={set('phone')}
              disabled={busy}
            />
          )}
        </Field>

        <Field
          name="message"
          label="Cover note"
          error={errors.message}
          hint={`${values.message.length}/${MAX_MESSAGE} characters`}
        >
          {(a) => (
            <textarea
              {...a}
              rows={4}
              maxLength={MAX_MESSAGE}
              value={values.message}
              onChange={set('message')}
              disabled={busy}
            />
          )}
        </Field>

        <Field
          name="cv"
          label="CV"
          required
          error={errors.cv}
          hint={file ? `${file.name} (${formatBytes(file.size)})` : 'PDF, DOC or DOCX, up to 5 MB.'}
        >
          {(a) => <input {...a} type="file" accept={CV_ACCEPT} onChange={onFile} disabled={busy} />}
        </Field>

        {/* Honeypot: hidden from people and assistive tech, bots tend to fill it in. */}
        <div className="hp" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <div className="field">
          <div className="consent">
            <input
              id={fieldId('consent')}
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) setErrors((er) => ({ ...er, consent: undefined }));
              }}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'ap-consent-err' : undefined}
              disabled={busy}
            />
            <label htmlFor={fieldId('consent')}>
              I agree to ELEN Engineering storing my details to process my application.
              {PRIVACY_URL && (
                <>
                  {' '}
                  <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
                    Privacy notice
                  </a>
                </>
              )}
            </label>
          </div>
          {errors.consent && (
            <p className="field-error" id="ap-consent-err">
              {errors.consent}
            </p>
          )}
        </div>

        {busy && (
          <div>
            <label htmlFor="ap-progress" className="hint">
              Uploading your CV…
            </label>
            <progress id="ap-progress" max={100} value={Math.round(progress * 100)} />
          </div>
        )}

        {submitError && (
          <div className="banner error" role="alert">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={busy}>
            {busy && <span className="spinner" aria-hidden="true" />}
            {busy ? 'Sending…' : 'Submit application'}
          </button>
          <button type="button" className="btn outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
