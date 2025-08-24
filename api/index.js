import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const PROJECT_ID =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  "click-tracker-eb57a"; // change if different

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Tiny request logger so we can SEE what's hitting the container
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "click-tracker-api", root: true, projectId: PROJECT_ID });
});

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "click-tracker-api", projectId: PROJECT_ID });
});


async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const m = authHeader.match(/^Bearer (.+)$/);
    if (!m) return res.status(401).json({ error: "Missing Bearer token" });

    const decoded = await admin.auth().verifyIdToken(m[1]);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err?.code || "unknown", err?.message || err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}


app.get("/me", authenticate, (req, res) => {
  const { uid, email, name, auth_time } = req.user;
  res.json({ uid, email, name: name || null, authTime: auth_time });
});

app.post("/ping", authenticate, (req, res) => {
  res.json({ ok: true, uid: req.user.uid, body: req.body ?? null });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API listening on :${port} (projectId=${PROJECT_ID})`);
});
