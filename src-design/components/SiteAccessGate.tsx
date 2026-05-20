import { useState, type ReactNode, type FormEvent } from "react";

const SESSION_KEY = "uw_site_access";
const VALID_USERNAME = "Admin";
const VALID_PASSWORD = "KSG@2026UE";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

interface Props {
  children: ReactNode;
}

export function SiteAccessGate({ children }: Props) {
  const [granted, setGranted] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  if (granted) return <>{children}</>;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setGranted(true);
    } else {
      setError("Invalid username or password.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <>
      {/* App rendered behind — blurred & non-interactive */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
        style={{ filter: "blur(3px)", transform: "scale(1.04)", transformOrigin: "center" }}
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(1,35,212,0.55) 0%, rgba(15,23,42,0.65) 50%, rgba(67,56,202,0.50) 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #0123D4 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* Glass card */}
        <div
          className="relative w-full max-w-sm rounded-2xl p-px"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            animation: shaking ? "sag-shake 0.45s ease" : undefined,
          }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
          >
            {/* Brand header */}
            <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-6 text-white"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Logo glow wrapper */}
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{
                  background: "rgba(1,35,212,0.6)",
                  boxShadow: "0 0 24px rgba(1,35,212,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">United Educators</p>
                <h1 className="text-xl font-bold tracking-tight" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                  UW Workbench
                </h1>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-7">
              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Sign in to access the workbench
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sag-username" className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.65)" }}>
                  Username
                </label>
                <input
                  id="sag-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  required
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sag-password" className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.65)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="sag-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg px-3 py-2 text-center text-xs font-medium"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #0123D4 0%, #3b4fd8 100%)",
                  boxShadow: "0 4px 16px rgba(1,35,212,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(1,35,212,0.6), inset 0 1px 0 rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(1,35,212,0.45), inset 0 1px 0 rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Access Workbench
              </button>

              <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                Protected access — authorized personnel only
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sag-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>
    </>
  );
}
