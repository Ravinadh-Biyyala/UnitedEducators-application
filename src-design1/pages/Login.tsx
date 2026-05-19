import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  GraduationCap, Eye, EyeOff, ShieldCheck, Users,
  AlertCircle, ArrowRight, CheckCircle2, Lock,
  Briefcase, UserCheck, Settings,
} from "lucide-react";
import { useAuth, DEMO_USERS, AppRole } from "../context/AuthContext";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const N    = "#0123D4";
const ND   = "#0118A0";
const NDD  = "#010F78";
const G    = "#C9A227";
const GD   = "#A8841C";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Role cards config ────────────────────────────────────────────────────────
interface RoleCard {
  appRole: AppRole;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  bg: string;
  features: string[];
  demoUser: { email: string; password: string; name: string };
}

const ROLE_CARDS: RoleCard[] = [
  {
    appRole: "underwriter",
    label: "Underwriter",
    sublabel: "UW / Sr. Underwriter",
    icon: <UserCheck size={18} />,
    color: N,
    border: `${N}40`,
    bg: `${N}08`,
    features: ["My submission queue", "Configure & quote", "Bind policies"],
    demoUser: {
      email: "sarah.mitchell@ue.org",
      password: "ue2024!",
      name: "Sarah Mitchell",
    },
  },
  {
    appRole: "uw_manager",
    label: "UW Manager",
    sublabel: "Team Lead / Manager",
    icon: <Briefcase size={18} />,
    color: "#7B2FBE",
    border: "#7B2FBE40",
    bg: "#7B2FBE08",
    features: ["All team submissions", "Assign & approve", "Team reporting"],
    demoUser: {
      email: "patricia.hoffman@ue.org",
      password: "ue2024!",
      name: "Patricia Hoffman",
    },
  },
  {
    appRole: "admin",
    label: "Admin",
    sublabel: "UW Director / Admin",
    icon: <Settings size={18} />,
    color: "#1A7A4A",
    border: "#1A7A4A40",
    bg: "#1A7A4A08",
    features: ["Full system access", "Manage users & roles", "Appetite & settings"],
    demoUser: {
      email: "robert.chen@ue.org",
      password: "ue2024!",
      name: "Robert Chen",
    },
  },
];

// ─── Animated background dots ──────────────────────────────────────────────────
function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.08 }}>
      <div style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        width: "100%",
        height: "100%",
      }} />
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const from = (location.state as any)?.from?.pathname ?? "/";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  const handleRoleSelect = (card: RoleCard) => {
    setSelectedRole(card.appRole);
    setEmail(card.demoUser.email);
    setPassword(card.demoUser.password);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 600);
    } else {
      setError(result.error ?? "Login failed.");
      setLoading(false);
    }
  };

  const activeCard = ROLE_CARDS.find(c => c.appRole === selectedRole);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, overflow: "hidden" }}>

      {/* ── LEFT PANEL ────────────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col"
        style={{
          width: "42%",
          minWidth: 380,
          background: `linear-gradient(160deg, ${NDD} 0%, ${ND} 45%, ${N} 100%)`,
          padding: "48px 44px",
          overflow: "hidden",
        }}
      >
        <DotGrid />

        {/* Gold top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${G} 0%, ${GD} 100%)`,
        }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-16">
          <div className="flex items-center justify-center"
            style={{ width: 44, height: 44, background: "rgba(201,162,39,0.18)", border: `1.5px solid ${G}55` }}>
            <GraduationCap size={24} color={G} />
          </div>
          <div>
            <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "white", lineHeight: 1.15, letterSpacing: "0.02em" }}>
              United Educators
            </p>
            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
              Underwriting Platform
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative flex-1">
          <h1 style={{
            fontSize: "2.0rem", fontWeight: 800, color: "white",
            lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 16,
          }}>
            Education Insurance<br />
            <span style={{ color: G }}>Underwriting</span><br />
            Made Smarter.
          </h1>
          <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 340, marginBottom: 36 }}>
            Purpose-built for school districts and educational institutions. Streamline submissions, quotes, and policy binding — all in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: <ShieldCheck size={15} />, text: "9 UE product lines in a single workflow" },
              { icon: <Users size={15} />,        text: "Role-based access for UW teams" },
              { icon: <CheckCircle2 size={15} />, text: "Real-time appetite scoring & alerts" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0"
                  style={{ width: 28, height: 28, background: "rgba(201,162,39,0.15)", border: `1px solid ${G}40`, color: G }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
            © 2024 United Educators. All rights reserved.<br />
            For authorized personnel only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-y-auto"
        style={{ background: "#F4F7FC", minWidth: 0 }}>

        {/* Top bar */}
        <div className="flex items-center justify-end px-10 py-5"
          style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#2E7D32" }} />
            <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 500 }}>System operational</span>
          </div>
        </div>

        {/* Form container */}
        <div className="flex flex-col items-center justify-center flex-1 px-10 py-10">
          <div style={{ width: "100%", maxWidth: 540 }}>

            {/* Heading */}
            <div className="mb-8">
              <h2 style={{ fontSize: "1.55rem", fontWeight: 800, color: TD, letterSpacing: "-0.02em" }}>
                Sign in to your account
              </h2>
              <p style={{ fontSize: "0.82rem", color: TT, marginTop: 6 }}>
                Select your role below to load demo credentials, or enter your own.
              </p>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label style={{ display: "block", fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 10 }}>
                I am signing in as
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ROLE_CARDS.map(card => {
                  const isActive = selectedRole === card.appRole;
                  return (
                    <button
                      key={card.appRole}
                      onClick={() => handleRoleSelect(card)}
                      className="flex flex-col items-center gap-2 px-3 py-4 transition-all text-center"
                      style={{
                        border: `2px solid ${isActive ? card.color : BDL}`,
                        background: isActive ? card.bg : "white",
                        boxShadow: isActive ? `0 4px 16px ${card.color}22` : "none",
                        transform: isActive ? "translateY(-1px)" : "none",
                        borderRadius: 6,
                      }}
                    >
                      <div className="flex items-center justify-center"
                        style={{
                          width: 38, height: 38,
                          background: isActive ? card.color : "#F0F3F8",
                          color: isActive ? "white" : TT,
                          transition: "all 0.18s",
                        }}>
                        {card.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.80rem", fontWeight: 700, color: isActive ? card.color : TD, lineHeight: 1.2 }}>
                          {card.label}
                        </p>
                        <p style={{ fontSize: "0.62rem", color: TT, marginTop: 2 }}>
                          {card.sublabel}
                        </p>
                      </div>

                      {/* Access bullets */}
                      {isActive && (
                        <div className="w-full mt-1 text-left space-y-1">
                          {card.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 size={9} color={card.color} style={{ flexShrink: 0 }} />
                              <span style={{ fontSize: "0.58rem", color: card.color, fontWeight: 600, lineHeight: 1.3 }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{
                background: "white",
                border: `1px solid ${activeCard ? activeCard.border : BDL}`,
                borderTop: `3px solid ${activeCard ? activeCard.color : N}`,
                padding: "28px 28px 24px",
                marginBottom: 16,
                transition: "border-color 0.2s",
              }}>

                {/* Demo hint */}
                {activeCard && (
                  <div className="flex items-center gap-2.5 p-3 mb-5"
                    style={{ background: `${activeCard.color}08`, border: `1px solid ${activeCard.border}` }}>
                    <div className="flex items-center justify-center shrink-0"
                      style={{ width: 28, height: 28, background: activeCard.color, color: "white", fontSize: "0.60rem", fontWeight: 800 }}>
                      {DEMO_USERS.find(u => u.appRole === activeCard.appRole)?.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: activeCard.color }}>
                        Demo: {activeCard.demoUser.name}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: TT }}>
                        Credentials pre-filled · Password: <strong style={{ color: TD }}>{activeCard.demoUser.password}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="mb-4">
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@ue.org"
                    autoComplete="username"
                    required
                    style={{
                      width: "100%", padding: "10px 14px",
                      border: `1px solid ${error ? "#E8A8A8" : BD}`,
                      fontSize: "0.88rem", fontFamily: font, outline: "none",
                      color: TD, background: "white",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = activeCard?.color ?? N}
                    onBlur={e => e.target.style.borderColor = error ? "#E8A8A8" : BD}
                  />
                </div>

                {/* Password */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Password
                    </label>
                    <button type="button"
                      style={{ fontSize: "0.68rem", color: N, fontWeight: 600, borderRadius: 6 }}
                      className="hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      style={{
                        width: "100%", padding: "10px 42px 10px 14px",
                        border: `1px solid ${error ? "#E8A8A8" : BD}`,
                        fontSize: "0.88rem", fontFamily: font, outline: "none",
                        color: TD, background: "white",
                      }}
                      onFocus={e => e.target.style.borderColor = activeCard?.color ?? N}
                      onBlur={e => e.target.style.borderColor = error ? "#E8A8A8" : BD}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity">
                      {showPw ? <EyeOff size={16} color={TT} /> : <Eye size={16} color={TT} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2.5 p-3 mb-4"
                    style={{ background: "#FBEAEA", border: "1px solid #E8A8A8", borderLeft: "3px solid #B91C1C" }}>
                    <AlertCircle size={14} color="#B91C1C" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: "0.75rem", color: "#7A1F1F", fontWeight: 600 }}>{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full flex items-center justify-center gap-2.5 py-3 transition-all active:scale-98"
                  style={{
                    background: success ? "#2E7D32" : activeCard ? activeCard.color : N,
                    color: "white",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    opacity: loading || success ? 0.9 : 1,
                    boxShadow: `0 4px 16px ${(activeCard?.color ?? N)}35`,
                    transition: "all 0.2s",
                    cursor: loading || success ? "not-allowed" : "pointer",
                    borderRadius: 6,
                  }}
                >
                  {success ? (
                    <><CheckCircle2 size={16} /> Signed In — Redirecting…</>
                  ) : loading ? (
                    <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                  ) : (
                    <><Lock size={15} /> Sign In <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
            </form>

            {/* All demo accounts */}
            <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: "#F8FAFC" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                  All Demo Accounts
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: BDL }}>
                {DEMO_USERS.map((u) => {
                  const card = ROLE_CARDS.find(c => c.appRole === u.appRole)!;
                  return (
                    <button key={u.id}
                      onClick={() => { setEmail(u.email); setPassword(u.password); setSelectedRole(u.appRole); setError(""); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50"
                      style={{ borderBottom: `1px solid ${BDL}`, borderRadius: 6 }}>
                      <div className="flex items-center justify-center shrink-0"
                        style={{ width: 30, height: 30, background: card.color, color: "white", fontSize: "0.62rem", fontWeight: 800 }}>
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: TD }}>{u.name}</p>
                        <p style={{ fontSize: "0.65rem", color: TT }}>{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span style={{
                          fontSize: "0.58rem", fontWeight: 700, padding: "2px 8px",
                          background: `${card.color}12`, color: card.color, border: `1px solid ${card.border}`,
                        }}>
                          {card.label}
                        </span>
                        <ArrowRight size={12} color={TT} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
