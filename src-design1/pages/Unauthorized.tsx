import { useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const N   = "#0123D4";
const G   = "#C9A227";
const font = "'Source Sans 3', system-ui, sans-serif";

export function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div style={{ fontFamily: font, minHeight: "100vh", background: "#EEF1F6", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${G},#A8841C)` }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
        <div style={{ width: 72, height: 72, background: "#FBEAEA", border: "1px solid #E8A8A8", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldAlert size={32} color="#B91C1C" />
        </div>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#1A2530" }}>Access Denied</h1>
        <p style={{ fontSize: "0.88rem", color: "#7A8FA3", textAlign: "center", maxWidth: 380, lineHeight: 1.6 }}>
          Your role (<strong style={{ color: N }}>{user?.roleLabel}</strong>) does not have permission to view this page. Contact your administrator if you believe this is an error.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 hover:bg-slate-100 transition-colors"
            style={{ border: "1px solid #C4CDD8", fontSize: "0.80rem", fontWeight: 600, color: "#4A5D6E", borderRadius: 6 }}>
            <ArrowLeft size={14} /> Go Back
          </button>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 transition-all hover:brightness-95"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
            Dashboard
          </button>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-2 px-5 py-2.5 hover:bg-red-50 transition-colors"
            style={{ border: "1px solid #E8A8A8", fontSize: "0.80rem", fontWeight: 600, color: "#B91C1C", borderRadius: 6 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
