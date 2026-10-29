export const MAX_CV_BYTES = 5 * 1024 * 1024; // storage.rules requires strictly less than this
export const MAX_MESSAGE = 2000;

/** Extension -> MIME type. Browsers often leave File.type empty for .doc/.docx, so we map it ourselves. */
export const CV_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const CV_ACCEPT = Object.keys(CV_MIME)
  .map((e) => `.${e}`)
  .concat(Object.values(CV_MIME))
  .join(',');

export interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export type FieldKey = 'name' | 'email' | 'phone' | 'message' | 'cv' | 'consent';
export type FormErrors = Partial<Record<FieldKey, string>>;

/** Order used to move focus to the first invalid field. */
export const FIELD_ORDER: FieldKey[] = ['name', 'email', 'phone', 'message', 'cv', 'consent'];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[\d\s+-]+$/;

export function cvExtension(fileName: string): string {
  const i = fileName.lastIndexOf('.');
  return i < 0 ? '' : fileName.slice(i + 1).toLowerCase();
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateApplication(v: FormValues, file: File | null, consent: boolean): FormErrors {
  const e: FormErrors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  const phone = v.phone.trim();

  if (name.length < 2) e.name = 'Please enter your full name (at least 2 characters).';
  else if (name.length > 100) e.name = 'Name must be 100 characters or fewer.';

  if (!email) e.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(email) || email.length > 254) e.email = 'Please enter a valid email address.';

  if (phone && (phone.length > 20 || !PHONE_RE.test(phone))) {
    e.phone = 'Use up to 20 characters: digits, spaces, + and -.';
  }

  if (v.message.length > MAX_MESSAGE) e.message = `Keep your note under ${MAX_MESSAGE} characters.`;

  if (!file) e.cv = 'Please attach your CV.';
  else if (!(cvExtension(file.name) in CV_MIME)) e.cv = 'Your CV must be a PDF, DOC or DOCX file.';
  else if (file.size === 0) e.cv = 'That file is empty. Please choose another.';
  else if (file.size >= MAX_CV_BYTES) e.cv = 'Your CV must be smaller than 5 MB.';

  if (!consent) e.consent = 'Please confirm that you agree before submitting.';

  return e;
}
