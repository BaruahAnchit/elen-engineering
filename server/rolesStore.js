// Where the roles come from (first match wins):
//   1. FIREBASE_DATABASE_URL + FIREBASE_SERVICE_ACCOUNT -> Realtime Database via Admin SDK (rules bypassed)
//   2. FIREBASE_DATABASE_URL only                        -> Realtime Database REST API (needs public read on /roles)
//   3. nothing set, or Firebase fails                    -> bundled data/roles.js
const localRoles = require("./data/roles");

const ROLES_PATH = process.env.ROLES_PATH || "roles";
const CACHE_MS = Number(process.env.ROLES_CACHE_SECONDS || 60) * 1000;
const FIELDS = ["title", "dept", "level", "location", "skills", "desc"];

let db = null;
function getDb() {
  if (db) return db;
  const { FIREBASE_SERVICE_ACCOUNT, FIREBASE_DATABASE_URL } = process.env;
  if (!FIREBASE_SERVICE_ACCOUNT || !FIREBASE_DATABASE_URL) return null;
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  const { getDatabase } = require("firebase-admin/database");
  const app = getApps()[0] || initializeApp({
    credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: FIREBASE_DATABASE_URL,
  });
  db = getDatabase(app);
  return db;
}

async function readRaw() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return (await getDb().ref(ROLES_PATH).get()).val();
  }
  const base = process.env.FIREBASE_DATABASE_URL.replace(/\/+$/, "");
  const res = await fetch(`${base}/${ROLES_PATH}.json`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`REST read failed: HTTP ${res.status} (check database rules allow read on /${ROLES_PATH})`);
  return res.json();
}

// RTDB returns an object keyed by push-id (or an array); keep only well-formed roles.
function normalize(value) {
  return Object.values(value || {})
    .filter((r) => r && FIELDS.every((f) => typeof r[f] === "string" && r[f]))
    .filter((r) => r.active !== false) // set "active": false in the DB to hide a role
    .map((r) => Object.fromEntries(FIELDS.map((f) => [f, r[f]])));
}

let cache = { at: 0, roles: null };

async function getRoles() {
  if (!process.env.FIREBASE_DATABASE_URL) return localRoles;
  if (cache.roles && Date.now() - cache.at < CACHE_MS) return cache.roles;
  try {
    cache = { at: Date.now(), roles: normalize(await readRaw()) };
    return cache.roles;
  } catch (err) {
    console.error("Firebase read failed:", err.message);
    return cache.roles || localRoles; // stale cache beats nothing
  }
}

module.exports = { getRoles, getDb, ROLES_PATH };
