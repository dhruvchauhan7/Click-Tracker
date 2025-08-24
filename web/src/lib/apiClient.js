// miniapp/web/src/lib/apiClient.js
import { auth } from "../lib/firebase";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, ""); // trim trailing slash

async function getIdToken() {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");
  return await u.getIdToken(); // fresh enough for typical use
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export async function apiGet(path) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function apiPost(path, body) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });
  return handle(res);
}

export { API_BASE };
