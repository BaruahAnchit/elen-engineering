// One-off: load the sample roles into /jobs.
//   export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
//   export FIREBASE_DATABASE_URL=https://<project>-default-rtdb.<region>.firebasedatabase.app
//   npm run seed
import { readFileSync } from 'node:fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const databaseURL = process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
  console.error('Set FIREBASE_DATABASE_URL first (see the comment at the top of this file).');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), databaseURL });

const roles = JSON.parse(readFileSync(new URL('../src/data/sampleRoles.json', import.meta.url), 'utf8'));
const now = Date.now();
const updates = {};
for (const { id, ...role } of roles) {
  updates[id] = { ...role, active: true, createdAt: now, updatedAt: now };
}

await getDatabase().ref('jobs').update(updates);
console.log(`Seeded ${roles.length} roles into /jobs`);
process.exit(0);
