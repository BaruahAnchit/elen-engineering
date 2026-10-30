const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { getRoles } = require("./rolesStore");
const applications = require("./applications");

const app = express();
const PORT = process.env.PORT || 8080;
const clientDist = path.join(__dirname, "..", "client", "dist");

// In production the client is served by this same server (same origin), so CORS
// only matters for the Vite dev server and any separately hosted front end.
// Add more origins with CORS_ORIGIN="https://a.example,https://b.example".
const allowedOrigins = [
  "http://localhost:5173",
  "https://elen-engineering-career-page.web.app",
  ...(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

app.disable("x-powered-by");
app.set("trust proxy", 1); // Render sits behind a proxy; needed for per-IP rate limiting

// ---- API ----
app.use("/api", cors({ origin: allowedOrigins }));

app.get("/api", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/roles", async (req, res) => {
  res.json({ roles: await getRoles() });
});

app.use("/api/applications", applications);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// JSON errors for the API (bad/oversized JSON bodies etc.)
app.use("/api", (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status === 500 ? "Server error." : "Invalid request." });
});

// ---- React build (production) ----
if (fs.existsSync(path.join(clientDist, "index.html"))) {
  // Vite fingerprints everything in /assets, so it can be cached for a year.
  app.use(
    "/assets",
    express.static(path.join(clientDist, "assets"), { immutable: true, maxAge: "1y" })
  );
  app.use(express.static(clientDist));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  console.log("client/dist not found - run `npm run build` to serve the React app from this server.");
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
