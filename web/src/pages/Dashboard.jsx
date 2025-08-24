import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import ClickCounter from "../Components/ClickCounter";
import { apiGet, apiPost, API_BASE } from "../lib/apiClient";

export default function Dashboard() {
  const { user } = useAuth();

  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meErr, setMeErr] = useState("");

  const [ping, setPing] = useState(null);
  const [pingErr, setPingErr] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) return;
      setMeLoading(true);
      setMeErr("");
      try {
        const data = await apiGet("/me");
        if (!ignore) setMe(data);
      } catch (e) {
        if (!ignore) setMeErr(String(e.message || e));
      } finally {
        if (!ignore) setMeLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user]);

  async function doPing() {
    setPing(null);
    setPingErr("");
    try {
      const data = await apiPost("/ping", {
        source: "dashboard",
        at: new Date().toISOString(),
      });
      setPing(data);
    } catch (e) {
      setPingErr(String(e.message || e));
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "32px auto", padding: 20, fontFamily: "system-ui" }}>
      <p style={{ marginTop: 0, color: "#555" }}>
        Signed in as <strong>{user?.email}</strong>
      </p>

      {/* Usage counter (Firestore) */}
      <section style={{ marginTop: 16, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Your usage</h2>
        <ClickCounter />
      </section>

      {/* API section */}
      <section style={{ marginTop: 16, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Backend API</h2>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
          API base: <code>{API_BASE || "(not set)"}</code>
        </div>

        <div style={{ marginBottom: 8 }}>
          <strong>/me</strong> {meLoading ? "Loading…" : me ? "✓ Loaded" : ""}
        </div>
        {meErr && <div style={{ color: "crimson", marginBottom: 8 }}>{meErr}</div>}
        {me && (
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, overflowX: "auto" }}>
            {JSON.stringify(me, null, 2)}
          </pre>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={doPing}>Ping API</button>
        </div>
        {pingErr && <div style={{ color: "crimson", marginTop: 8 }}>{pingErr}</div>}
        {ping && (
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, overflowX: "auto", marginTop: 8 }}>
            {JSON.stringify(ping, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
