import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Inbox, CheckSquare,
  Mail, BarChart2, ShieldCheck, Settings, LogOut,
  Bell, ChevronDown, Menu, X,
  UserCheck, Briefcase, Crown, Users,
  Calendar, Flag, Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../context/AuthContext";
import { CompanionPanel, CompanionBackgroundTray } from "./companion/CompanionPanel";
import { useCompanion } from "./companion/CompanionContext";
import ueLogo from "../Images/ue-logo.webp";

// ─── Design tokens ────────────────────────────────────────────────────────────
const N   = "#0123D4";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

export type RoleId = "uw" | "sr-uw" | "lead" | "director";

// ─── Role badge colors ────────────────────────────────────────────────────────
const ROLE_COLORS: Record<AppRole, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  underwriter: { bg: `${N}14`,  text: N,       border: `${N}30`,  icon: <UserCheck size={10}/> },
  uw_manager:  { bg: "#7B2FBE14", text: "#7B2FBE", border: "#7B2FBE30", icon: <Briefcase size={10}/> },
  admin:       { bg: "#1A7A4A14", text: "#1A7A4A", border: "#1A7A4A30", icon: <Crown size={10}/> },
};

// ─── Nav items (unchanged) ────────────────────────────────────────────────────
const NAV_BASE = [
  { id: "dashboard",     label: "Dashboard",      icon: LayoutDashboard, path: "/",              roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "submissions",   label: "Submissions",    icon: Inbox,           path: "/submissions",   roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "renewals",      label: "Renewals",       icon: Calendar,        path: "/renewals",      roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "inbox",         label: "Inbox",          icon: Mail,            path: "/inbox",         roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "tasks",         label: "Tasks",          icon: CheckSquare,     path: "/tasks",         roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "approvals",     label: "Approvals",      icon: Flag,            path: "/approvals",     roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "notifications", label: "Notifications",  icon: Bell,            path: "/notifications", roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "activity",      label: "Activity",       icon: Activity,        path: "/activity",      roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "portfolio",     label: "Portfolio",      icon: BarChart2,       path: "/portfolio",     roles: ["sr-uw","lead","director"] as RoleId[] },
  { id: "appetite",      label: "Appetite Rules", icon: ShieldCheck,     path: "/appetite",      roles: ["lead","director"] as RoleId[] },
  { id: "users",         label: "User Management",icon: Users,           path: "/users",         roles: ["director"] as RoleId[] },
];

interface AppShellProps {
  activePage: string;
  role?: RoleId;              // optional: overridden by auth context
  onRoleChange?: (r: RoleId) => void;
  search?: string;
  onSearchChange?: (s: string) => void;
  children: React.ReactNode;
}

export function AppShell({
  activePage,
  role: roleProp,
  children,
}: AppShellProps) {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const { collapsed: companionCollapsed } = useCompanion();
  const [userDrop,   setUserDrop]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Must match the width of the open CompanionPanel <aside>. Reserve that
  // space on the right of <main> so page content shifts left instead of
  // being overlapped.
  const COMPANION_WIDTH = 300;

  const effectiveRoleId: RoleId = user?.roleId ?? roleProp ?? "uw";
  const navItems = NAV_BASE.filter(item => item.roles.includes(effectiveRoleId));

  const handleNav = (item: typeof NAV_BASE[0]) => {
    if (item.id === "dashboard")          navigate("/");
    else if (item.id === "submissions")   navigate("/submissions");
    else if (item.id === "renewals")      navigate("/renewals");
    else if (item.id === "inbox")         navigate("/inbox");
    else if (item.id === "tasks")         navigate("/tasks");
    else if (item.id === "approvals")     navigate("/approvals");
    else if (item.id === "notifications") navigate("/notifications");
    else if (item.id === "activity")      navigate("/activity");
    else if (item.id === "portfolio")     navigate("/portfolio");
    else if (item.id === "appetite")      navigate("/appetite");
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const roleColor = user ? ROLE_COLORS[user.appRole] : ROLE_COLORS["underwriter"];

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ fontFamily: font, background: "#EEF1F6" }}
    >
      {/* ── TOP NAV ───────────────────────────────────────────────────────────
          Replaces the former left sidebar. Logo (left) · primary nav items
          (middle, horizontally scrollable on narrow viewports) · user pill
          (right). On mobile the middle collapses into a hamburger that
          reveals a vertical drawer below the header. */}
      <header
        className="flex items-stretch shrink-0 relative z-30"
        style={{
          background: "white",
          borderBottom: `1px solid ${BDL}`,
          minHeight: 56,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center shrink-0"
          style={{ padding: "0 18px", borderRight: `1px solid ${BDL}` }}
        >
          <img
            src={ueLogo}
            alt="United Educators"
            style={{ height: 30, width: "auto", maxWidth: 168, objectFit: "contain" }}
          />
        </div>

        {/* Primary nav — desktop */}
        <nav
          className="hidden lg:flex items-stretch flex-1 min-w-0 overflow-x-auto"
          aria-label="Primary"
          style={{ scrollbarWidth: "thin" }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className="inline-flex items-center gap-2 shrink-0 transition-colors"
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F6F8FB"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                style={{
                  padding: "0 16px",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? N : TM,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: isActive ? `3px solid ${N}` : "3px solid transparent",
                  // Compensate so active border doesn't push label up
                  paddingTop: 3,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={15} style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="lg:hidden ml-auto inline-flex items-center justify-center"
          aria-label="Toggle navigation"
          style={{
            margin: "12px 12px 12px 0",
            width: 34, height: 34,
            border: `1px solid ${BDL}`, borderRadius: 6,
            background: "white", cursor: "pointer",
          }}
        >
          {mobileOpen ? <X size={15} color={TM}/> : <Menu size={15} color={TM}/>}
        </button>

        {/* User pill (right) */}
        {user && (
          <div
            className="relative shrink-0 flex items-center"
            style={{
              padding: "0 12px",
              borderLeft: `1px solid ${BDL}`,
            }}
          >
            <button
              onClick={() => setUserDrop(v => !v)}
              className="flex items-center transition-colors hover:bg-slate-50"
              style={{
                gap: 8,
                padding: "6px 10px",
                border: `1px solid ${BDL}`, borderRadius: 7,
                background: userDrop ? "#F0F3F8" : "white",
                cursor: "pointer",
              }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 28, height: 28, background: roleColor.text, color: "white", fontSize: "0.66rem", fontWeight: 800, borderRadius: 5 }}
              >
                {user.initials}
              </div>
              <div className="hidden md:flex flex-col text-left min-w-0">
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1A2530", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{user.name}</p>
                <p style={{ fontSize: "0.58rem", color: roleColor.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{user.roleLabel}</p>
              </div>
              <ChevronDown size={12} color={TT} style={{ transform: userDrop ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }} />
            </button>

            {userDrop && (
              <div
                className="absolute z-50"
                style={{
                  width: 280,
                  background: "white", border: `1px solid ${BD}`,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                  borderRadius: 8,
                  top: "calc(100% + 6px)",
                  right: 12,
                }}
              >
                <div className="px-4 py-4" style={{ borderBottom: `1px solid ${BDL}`, background: "#F8FAFC" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 40, height: 40, background: roleColor.text, color: "white", fontSize: "0.80rem", fontWeight: 800, borderRadius: 6 }}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1A2530" }}>{user.name}</p>
                      <p style={{ fontSize: "0.68rem", color: TT }}>{user.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span style={{ color: roleColor.text }}>{roleColor.icon}</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: roleColor.text }}>{user.roleLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BDL}` }}>
                  <p style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>
                    Access Level
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: "View Submissions", allowed: user.permissions.includes("view_all_submissions") || user.permissions.includes("view_team_submissions") || user.permissions.includes("view_own_submissions") },
                      { label: "Approve Quotes",   allowed: user.permissions.includes("approve_quotes") },
                      { label: "Bind Policies",    allowed: user.permissions.includes("bind_policy") },
                      { label: "Manage Users",     allowed: user.permissions.includes("manage_users") },
                      { label: "Appetite Rules",   allowed: user.permissions.includes("view_appetite_rules") },
                      { label: "Admin Settings",   allowed: user.permissions.includes("view_admin_settings") },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="shrink-0" style={{
                          width: 14, height: 14,
                          background: p.allowed ? "#E8F5EC" : "#F9FAFB",
                          border: `1px solid ${p.allowed ? "#93C8A0" : BDL}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {p.allowed
                            ? <span style={{ fontSize: 9, color: "#2E7D32", fontWeight: 800 }}>✓</span>
                            : <span style={{ fontSize: 9, color: BD, fontWeight: 800 }}>–</span>}
                        </div>
                        <span style={{ fontSize: "0.70rem", color: p.allowed ? "#1A2530" : TT, fontWeight: p.allowed ? 500 : 400 }}>
                          {p.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${BDL}` }}>
                  <span style={{ fontSize: "0.68rem", color: TT }}>
                    Team: <strong style={{ color: "#1A2530" }}>{user.team}</strong>
                    &nbsp;·&nbsp;{user.dept}
                  </span>
                </div>
                <div className="px-4 py-3 space-y-1">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                    style={{ fontSize: "0.78rem", color: "#1A2530", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer" }}>
                    <Settings size={14} color={TT} /> Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 transition-colors text-left"
                    style={{ fontSize: "0.78rem", color: "#B91C1C", fontWeight: 600, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer" }}>
                    <LogOut size={14} color="#B91C1C" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Mobile nav drawer ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden shrink-0"
          style={{ background: "white", borderBottom: `1px solid ${BDL}` }}
        >
          <nav className="flex flex-col py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center w-full text-left transition-colors"
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "white" : TM,
                    background: isActive ? N : "transparent",
                    gap: 10, padding: "10px 16px",
                    border: "none", cursor: "pointer",
                  }}
                >
                  <Icon size={16} style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────────────────────────
          When the Companion panel is open, shrink <main> by 400px on the
          right so page content (and the scrollbar) sit beside the panel
          instead of underneath it. */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          background: "#EEF1F6",
          marginRight: companionCollapsed ? 0 : COMPANION_WIDTH,
          transition: "margin-right 0.2s ease",
        }}
      >
        {children}
      </main>

      {/* Page-aware Companion right rail + background-job tray */}
      <CompanionPanel />
      <CompanionBackgroundTray />
    </div>
  );
}
