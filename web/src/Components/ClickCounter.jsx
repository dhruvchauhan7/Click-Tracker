import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../auth/AuthProvider";

export default function ClickCounter() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "usage", user.uid);

    // Ensure the doc exists (idempotent) without resetting existing count
    setDoc(ref, { clickCount: increment(0), updatedAt: serverTimestamp() }, { merge: true })
      .catch((e) => setErr(e.message));

    // Live subscription to this user's count
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data();
        setCount(data?.clickCount ?? 0);
        setLoading(false);
      },
      (e) => {
        setErr(e.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  async function handleClick() {
    setErr("");
    try {
      const ref = doc(db, "usage", user.uid);
      await updateDoc(ref, {
        clickCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      // If updateDoc fails because the doc didn't exist for some reason, create it and retry once
      try {
        const ref = doc(db, "usage", user.uid);
        await setDoc(ref, { clickCount: 1, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e2) {
        setErr(e2.message);
      }
    }
  }

  async function reset() {
    setErr("");
    try {
      const ref = doc(db, "usage", user.uid);
      await setDoc(ref, { clickCount: 0, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loading) return <div>Loading your usage…</div>;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div>
        <strong>Your clicks:</strong> {count}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleClick}>Click me</button>
        <button onClick={reset}>Reset</button>
      </div>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <small style={{ color: "#666" }}>
        Stored at <code>usage/{user?.uid}</code> in Firestore.
      </small>
    </section>
  );
}
