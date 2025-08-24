// src/components/TopBar.jsx
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../auth/AuthProvider";

export default function TopBar() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div style={{
      maxWidth: 720, margin: "16px auto 0", padding: "8px 12px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontFamily: "system-ui", fontSize: 14
    }}>
      <span>Signed in as <strong>{user.email}</strong></span>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </div>
  );
}
