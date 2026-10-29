# ELEN Engineering Careers (React + TypeScript + Firebase)

Vite + React 18 + TypeScript front end, Firebase Realtime Database / Auth / Storage, and a
Cloud Function that emails every application to a recruiter address set **on the server**.

## How "Apply" works

```
Apply button -> form dialog -> anonymous sign-in -> CV uploaded to Storage (cvs/{uid}/...)
             -> record written to /applications/{id}
             -> Cloud Function onApplicationCreated -> email to HR_EMAIL (Reply-To = candidate)
```

* The recipient (`HR_EMAIL`) and SMTP credentials live only in Functions config. Nothing about
  them is in `src/` or in the built site.
* The email contains the candidate's details and a **signed CV link valid for 7 days** (the CV is not attached).
* Visitors can create an application but never read, edit or delete one (see `database.rules.json`, `storage.rules`).

## 1. One-time Firebase setup

1. Upgrade the project to the **Blaze** plan (needed for Functions and Storage; check current pricing, set a budget alert).
2. Build > **Realtime Database** > create it. The region is permanent. For an India audience pick `asia-southeast1`
   and keep `REGION` in `functions/src/index.ts` equal to it.
3. Build > **Storage** > get started.
4. Build > **Authentication** > Sign-in method > enable **Anonymous**.
5. Project settings > Your apps > add a **Web app**, then copy its config into `.env` (see `.env.example`).
6. (Recommended) **App Check** > register the web app with reCAPTCHA v3, put the site key in `VITE_RECAPTCHA_SITE_KEY`,
   then enforce it for Realtime Database and Storage.

## 2. Configure the email

```bash
cp functions/.env.example functions/.env.elen-engineering-career-page   # edit HR_EMAIL, SMTP_HOST, SMTP_USER, MAIL_FROM
firebase functions:secrets:set SMTP_PASS
```

Any SMTP provider works (Brevo, SendGrid, Resend, SES, Google Workspace relay). `MAIL_FROM` must be a sender
your provider has verified. Set `SEND_AUTOREPLY=true` to also acknowledge the candidate.

## 3. Run and deploy

```bash
npm install && npm --prefix functions install
cp .env.example .env            # fill in the Firebase web config
npm run dev                     # http://localhost:5173

firebase deploy --only database,storage,functions,hosting
```

Optional: seed the six sample roles into `/jobs`
(`GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json FIREBASE_DATABASE_URL=... npm run seed`).
HR then edits roles in the Firebase console. Until `/jobs` has active roles (or if it is unreachable)
the page falls back to the bundled sample roles in `src/data/sampleRoles.json`.

Admin access (to read applications / edit jobs) is a custom claim, set once from a trusted script:
`await getAuth().setCustomUserClaims(uid, { admin: true })`.

## Local testing with the Emulator Suite

Set `VITE_USE_EMULATORS=true`, run `npm --prefix functions run build && firebase emulators:start`, and point
`SMTP_HOST`/`SMTP_PORT` at a catch-all test inbox (e.g. Mailpit on `localhost:1025`).

## Things to know

* `firebase.json` now serves **`dist/`** (the Vite build output) instead of `public/`. If you already have a
  `firebase.json`, merge: keep your `auth` provider block and take the `hosting.public`, `storage`, `functions` and `emulators` entries.
* If the function logs a `signBlob` / permission error when creating the CV link, grant its runtime service account the
  **Service Account Token Creator** role on itself.
* Node 22 is set in `functions/package.json`; use whatever runtime Firebase supports when you deploy.
* Initial JS is ~113 kB gzipped; Auth and Storage load only when someone submits the form.

## Not built yet (from the spec)

Contact form, scheduled retention/cleanup job, and the HR admin page. The privacy notice link is a placeholder:
set `VITE_PRIVACY_URL` once the company has approved one.

## Layout

```
src/            React app (components/, lib/firebase.ts, lib/jobs.ts, lib/applications.ts, lib/validation.ts)
functions/      Cloud Function (TypeScript) that sends the email
public/images/  images that used to be base64 inside index.html
database.rules.json, storage.rules, firebase.json, .firebaserc
```
