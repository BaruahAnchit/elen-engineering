const crypto = require("crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const { getRoles, getDb } = require("./rolesStore");
const mailer = require("./mailer");

const router = express.Router();

// Public endpoint that can trigger emails, so keep it tight.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many applications from this network. Please try again later." },
});

const str = (v) => (typeof v === "string" ? v.trim() : "");

function validate(b) {
  const v = {
    roleTitle: str(b.roleTitle),
    name: str(b.name),
    email: str(b.email).toLowerCase(),
    phone: str(b.phone),
    message: str(b.message),
    cvUrl: str(b.cvUrl),
  };
  const f = {};
  if (!v.roleTitle || v.roleTitle.length > 120) f.roleTitle = "Choose a role.";
  if (v.name.length < 2 || v.name.length > 100) f.name = "Enter your full name (2-100 characters).";
  if (v.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) f.email = "Enter a valid email address.";
  if (v.phone && !/^[0-9+()\-.\s]{7,20}$/.test(v.phone)) f.phone = "Enter a valid phone number.";
  if (v.message.length > 2000) f.message = "Please keep this under 2000 characters.";
  if (v.cvUrl) {
    let ok = v.cvUrl.length <= 500;
    try { ok = ok && ["http:", "https:"].includes(new URL(v.cvUrl).protocol); } catch { ok = false; }
    if (!ok) f.cvUrl = "Enter a link starting with http:// or https://";
  }
  if (b.consent !== true) f.consent = "Please agree so we can process your application.";
  return { v, f };
}

router.post("/", limiter, express.json({ limit: "20kb" }), async (req, res) => {
  const body = req.body || {};

  // Honeypot: real people never see this field. Pretend success so bots learn nothing.
  if (str(body.website)) return res.status(201).json({ ok: true, emailQueued: false });

  const { v, f } = validate(body);
  if (Object.keys(f).length) return res.status(400).json({ error: "Please correct the highlighted fields.", fields: f });

  const roles = await getRoles();
  if (!roles.some((r) => r.title === v.roleTitle)) {
    return res.status(400).json({ error: "That role is no longer available.", fields: {} });
  }

  let ref;
  try {
    const db = getDb();
    if (!db) throw new Error("FIREBASE_SERVICE_ACCOUNT / FIREBASE_DATABASE_URL not set");
    // One application per email per role; the key makes the duplicate check atomic.
    const key = crypto.createHash("sha1").update(`${v.email}|${v.roleTitle}`).digest("hex");
    ref = db.ref(`applications/${key}`);
    const record = {
      roleTitle: v.roleTitle,
      name: v.name,
      email: v.email,
      phone: v.phone || null,
      message: v.message || null,
      cvUrl: v.cvUrl || null,
      createdAt: new Date().toISOString(),
      emailStatus: mailer.isConfigured() ? "pending" : "not_configured",
    };
    const result = await ref.transaction((current) => (current === null ? record : undefined));
    if (!result.committed) {
      return res.status(409).json({ error: "You have already applied for this role with this email address.", fields: {} });
    }
  } catch (err) {
    console.error("Saving application failed:", err.message);
    return res.status(503).json({ error: "We couldn't save your application right now. Please try again later.", fields: {} });
  }

  // Saved. Reply now; the email goes out in the background so a slow or blocked SMTP can't hang the form.
  const emailQueued = mailer.isConfigured();
  res.status(201).json({ ok: true, emailQueued });

  if (emailQueued) {
    mailer
      .sendApplicationConfirmation({ to: v.email, name: v.name, roleTitle: v.roleTitle })
      .then(() => ref.update({ emailStatus: "sent" }))
      .catch((err) => {
        console.error("Confirmation email failed:", err.message);
        return ref.update({ emailStatus: "failed", emailError: String(err.message).slice(0, 200) });
      })
      .catch(() => {});
  }
});

module.exports = router;
