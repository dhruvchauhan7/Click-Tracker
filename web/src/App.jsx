// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import { signOut } from "firebase/auth";
import { auth } from "./lib/firebase";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

function Nav() {
  const { user } = useAuth();
  return (
    <nav
      style={{
        padding: 12,
        display: "flex",
        gap: 12,
        borderBottom: "1px solid #ddd",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {/* Logged OUT: show Sign In + Sign Up (no Dashboard) */}
        {!user && (
          <>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}

        {/* Logged IN: show Dashboard link */}
        {user && <Link to="/dashboard">Dashboard</Link>}
      </div>

      {/* Logged IN: single Sign out button */}
      {user && <button onClick={() => signOut(auth)}>Sign out</button>}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
