import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUp() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      nav("/dashboard");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Create account</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Name
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Jane Doe" />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
        </label>
        <label style={{ position: "relative" }}>
          Password
          <input
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
            minLength={6}
            style={{ paddingRight: 32 }}
          />
          <span
            onClick={() => setShowPwd(!showPwd)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
          >
            {showPwd ? <FaEyeSlash /> : <FaEye />}
          </span>
        </label>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button disabled={busy} type="submit">{busy ? "Creating…" : "Sign Up"}</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </main>
  );
}
