# Elen Engineering – Careers page

React (Vite + TypeScript) client served by an Express server. One Render web service hosts both.

```
client/   React app (Vite). Page sections are components in src/components.
server/   Express 5. GET /api (health), GET /api/roles, POST /api/applications, serves client/dist in production.
render.yaml   Render Blueprint
```

## Run locally

```bash
npm --prefix server install
npm --prefix client install

npm run dev:server   # terminal 1 -> http://localhost:8080
npm run dev:client   # terminal 2 -> http://localhost:5173 (proxies /api to :8080)
```

Production-style check (what Render runs):

```bash
npm run build && PORT=10000 npm start   # http://localhost:10000
```

## Deploy to Render

1. Push this folder to a GitHub/GitLab repo (`node_modules` and `dist` are git-ignored).
2. Render dashboard -> **New -> Blueprint** -> select the repo. Render reads `render.yaml`.
3. Apply. Build runs `npm run build`, start runs `npm start`, health check is `/api`.

Manual alternative (New -> Web Service): Runtime `Node`, Build Command `npm run build`,
Start Command `npm start`, Health Check Path `/api`, env var `NODE_VERSION=22`.

### Environment variables (all optional)

| Variable      | Purpose |
|---------------|---------|
| `FIREBASE_*`  | See the Firebase section below. |
| `CORS_ORIGIN` | Comma-separated extra origins allowed to call `/api` (only needed if a front end is hosted elsewhere, e.g. Firebase Hosting). |

## Roles from Firebase Realtime Database (optional)

Without `FIREBASE_DATABASE_URL` the server uses `server/data/roles.js`. With it, `/api/roles` reads from Realtime Database
(cached 60 s; if Firebase is unreachable it serves the last good copy, else `roles.js`).

**Option A - REST (simplest, no secret key).** Job listings are public, so allow public *read* on `/roles` only:

```json
{ "rules": { ".read": false, ".write": false, "roles": { ".read": true } } }
```

1. Realtime Database -> Rules -> paste the above -> Publish.
2. Realtime Database -> Data -> menu (three dots) -> **Import JSON** -> choose `server/data/roles.import.json`.
3. Set `FIREBASE_DATABASE_URL` (e.g. `https://<project>-default-rtdb.<region>.firebasedatabase.app`) in Render -> Environment.

**Option B - Admin SDK (database fully locked).** Keep rules at `".read": false, ".write": false`, then additionally set
`FIREBASE_SERVICE_ACCOUNT` to the entire contents of a private-key JSON (Project settings -> Service accounts -> Generate new
private key). The server then bypasses rules, and `cd server && npm run seed` can load the roles for you.
Never commit that key file. Note the web-app `firebaseConfig` snippet is *not* this key.

Optional: `ROLES_PATH` (default `roles`), `ROLES_CACHE_SECONDS` (default `60`).

Data shape: `/roles/<any-key>` -> `{ title, dept, level, location, skills, desc, active }`. All string fields are required;
set `active: false` to hide a role. Edits in the Firebase console appear on the site within a minute.
`dept`, `level` and `location` should match the dropdown values in `client/src/constants.ts`, otherwise filters won't match.

## Application form (saves to Firebase + emails a confirmation)

`POST /api/applications` validates the form, saves it to Realtime Database at `/applications/<sha1(email|role)>`
(so one application per email per role; repeats get a 409), then emails the applicant a confirmation.
The email is sent in the background: the application is saved even if the email fails, and the record's `emailStatus`
becomes `sent`, `failed` (with `emailError`) or `not_configured`. Review applications in Firebase console -> Realtime Database -> Data -> `applications`.

Required env vars: `FIREBASE_DATABASE_URL` and `FIREBASE_SERVICE_ACCOUNT` (writes need the Admin SDK), plus for email:

| Variable             | Purpose |
|----------------------|---------|
| `GMAIL_USER`         | The Gmail address that sends the confirmations. |
| `GMAIL_APP_PASSWORD` | A Google **App Password** (needs 2-Step Verification: Google Account -> Security -> App passwords). Not your normal password. |
| `MAIL_FROM_NAME`     | Optional sender name (default `Elen Engineering Careers`). |

**Render free tier blocks outbound SMTP (ports 465/587), so Gmail emails will time out there** (applications are still saved).
Email works locally and on a paid Render instance. To keep the free tier, swap `server/mailer.js` for an HTTPS email API
(Resend, Brevo, ...); nothing else needs to change.

Keep your database rules private (`".read": false` at the root) so `/applications` is never publicly readable. It contains personal data.
Abuse protection: honeypot field, 10 requests per IP per 15 minutes, 20 KB body limit, role must exist.

## Editing content

- Roles: `server/data/roles.js`
- Page copy/sections: `client/src/components/`
- Styles: `client/src/index.css`
