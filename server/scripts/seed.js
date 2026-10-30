// One-off: copy data/roles.js into Realtime Database.  Usage (from /server):
//   FIREBASE_SERVICE_ACCOUNT='<json>' FIREBASE_DATABASE_URL='https://<db>.firebaseio.com' npm run seed
const { getDb, ROLES_PATH } = require("../rolesStore");
const roles = require("../data/roles");

const db = getDb();
if (!db) {
  console.error("Set FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL first.");
  process.exit(1);
}
const ref = db.ref(ROLES_PATH);
(async () => {
  await ref.set(null); // replace existing roles
  for (const role of roles) await ref.push({ ...role, active: true });
  console.log(`Seeded ${roles.length} roles at /${ROLES_PATH}`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
