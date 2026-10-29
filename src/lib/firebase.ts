import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator, type Database } from 'firebase/database';
import type { FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const env = import.meta.env;

const config: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.databaseURL && config.projectId && config.storageBucket && config.appId,
);

export interface FirebaseServices {
  app: FirebaseApp;
  db: Database;
}

let services: FirebaseServices | null | undefined;

/**
 * Lazily initialises Firebase. Returns null when the .env values are missing so the
 * page still renders (with the bundled sample roles) instead of crashing.
 */
export function getFirebase(): FirebaseServices | null {
  if (services !== undefined) return services;
  if (!isFirebaseConfigured) {
    services = null;
    return services;
  }

  const app = initializeApp(config);

  const siteKey = env.VITE_RECAPTCHA_SITE_KEY;
  if (siteKey) {
    // In local dev, App Check prints a debug token to the console. Register it in the
    // Firebase console (App Check > Apps > Manage debug tokens).
    if (import.meta.env.DEV) {
      Object.assign(self, { FIREBASE_APPCHECK_DEBUG_TOKEN: true });
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }

  const db = getDatabase(app);
  if (env.VITE_USE_EMULATORS === 'true') connectDatabaseEmulator(db, '127.0.0.1', 9000);

  services = { app, db };
  return services;
}

export interface SubmitServices {
  auth: Auth;
  storage: FirebaseStorage;
}

let submitServices: Promise<SubmitServices> | undefined;

/**
 * Auth and Storage are only needed when someone submits the form, so they are loaded on
 * demand. This keeps them out of the initial bundle (the page itself only reads jobs).
 */
export function getSubmitServices(): Promise<SubmitServices> {
  submitServices ??= (async () => {
    const fb = getFirebase();
    if (!fb) throw new Error('NOT_CONFIGURED');
    const [authMod, storageMod] = await Promise.all([import('firebase/auth'), import('firebase/storage')]);
    const auth = authMod.getAuth(fb.app);
    const storage = storageMod.getStorage(fb.app);
    if (env.VITE_USE_EMULATORS === 'true') {
      authMod.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      storageMod.connectStorageEmulator(storage, '127.0.0.1', 9199);
    }
    return { auth, storage };
  })().catch((err) => {
    submitServices = undefined; // allow a retry after a failed chunk load
    throw err;
  });
  return submitServices;
}
