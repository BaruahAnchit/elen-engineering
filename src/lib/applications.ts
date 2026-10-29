import { push, ref, serverTimestamp, set } from 'firebase/database';
import { getFirebase, getSubmitServices } from './firebase';
import { CV_MIME, cvExtension, type FormValues } from './validation';

export interface ApplicationInput extends FormValues {
  /** Job id, or "general" for a general application. */
  jobId: string;
  jobTitle: string;
  file: File;
}

export const GENERAL_JOB_ID = 'general';
export const GENERAL_JOB_TITLE = 'General application';

function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return `${base || 'cv'}.${cvExtension(name)}`;
}

/**
 * 1. Make sure the visitor has an anonymous session (rules bind writes to a uid).
 * 2. Upload the CV to cvs/{uid}/...
 * 3. Create /applications/{pushId}. A Cloud Function emails the recruiter from there.
 *
 * Resolves to the application reference ID.
 */
export async function submitApplication(
  input: ApplicationInput,
  onProgress: (fraction: number) => void,
): Promise<string> {
  const fb = getFirebase();
  if (!fb) throw new Error('NOT_CONFIGURED');

  const [{ auth, storage }, { signInAnonymously }, { ref: storageRef, uploadBytesResumable }] = await Promise.all([
    getSubmitServices(),
    import('firebase/auth'),
    import('firebase/storage'),
  ]);

  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

  const ext = cvExtension(input.file.name);
  const cvPath = `cvs/${user.uid}/${Date.now()}-${sanitizeFileName(input.file.name)}`;
  const task = uploadBytesResumable(storageRef(storage, cvPath), input.file, {
    contentType: CV_MIME[ext],
  });

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress(snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0),
      reject,
      () => resolve(),
    );
  });

  const appRef = push(ref(fb.db, 'applications'));
  const record: Record<string, unknown> = {
    uid: user.uid,
    jobId: input.jobId,
    jobTitle: input.jobTitle,
    name: input.name.trim(),
    email: input.email.trim(),
    cvPath,
    status: 'new',
    emailSent: false,
    createdAt: serverTimestamp(),
  };
  const phone = input.phone.trim();
  const message = input.message.trim();
  if (phone) record.phone = phone;
  if (message) record.message = message;

  await set(appRef, record);
  return appRef.key ?? '';
}

/** Turn SDK errors into something a candidate can act on. */
export function friendlyError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
  const message = err instanceof Error ? err.message : '';

  if (message === 'NOT_CONFIGURED') {
    return 'Online applications are not switched on for this site yet. Please try again later.';
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
    return 'We could not start a secure session. Please try again later.';
  }
  if (code === 'storage/unauthorized' || code === 'PERMISSION_DENIED' || message.includes('PERMISSION_DENIED')) {
    return 'We could not accept that submission. Check your CV is a PDF, DOC or DOCX under 5 MB and try again.';
  }
  if (code === 'storage/retry-limit-exceeded' || code === 'auth/network-request-failed' || code === 'unavailable') {
    return 'The connection dropped while sending your application. Check your internet and try again.';
  }
  return 'Something went wrong while sending your application. Your details are still in the form, so please try again.';
}
