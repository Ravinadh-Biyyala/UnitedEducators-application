import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap, LayoutDashboard, Inbox, CheckSquare,
  Mail, BarChart2, ShieldCheck, Settings, LogOut,
  Search, Bell, ChevronDown, Menu, X, Plus,
  UserCheck, Briefcase, Crown, Users,
  FileText, CheckCircle2, Send, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../context/AuthContext";
import { ChatBot } from "./ChatBot";

// ─── Design tokens ────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

export type RoleId = "uw" | "sr-uw" | "lead" | "director";

// ─── Role badge colors ────────────────────────────────────────────────────────
const ROLE_COLORS: Record<AppRole, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  underwriter: { bg: `${N}14`,  text: N,       border: `${N}30`,  icon: <UserCheck size={10}/> },
  uw_manager:  { bg: "#7B2FBE14", text: "#7B2FBE", border: "#7B2FBE30", icon: <Briefcase size={10}/> },
  admin:       { bg: "#1A7A4A14", text: "#1A7A4A", border: "#1A7A4A30", icon: <Crown size={10}/> },
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_BASE = [
  { id: "dashboard",   label: "Dashboard",     icon: LayoutDashboard, path: "/",            roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "submissions", label: "Submissions",   icon: Inbox,           path: "/submissions", roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "tasks",       label: "Task Queue",    icon: CheckSquare,     path: "/tasks",       roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "inbox",       label: "Inbox",         icon: Mail,            path: "/inbox",       roles: ["uw","sr-uw","lead","director"] as RoleId[] },
  { id: "portfolio",   label: "Portfolio",     icon: BarChart2,       path: "/portfolio",   roles: ["sr-uw","lead","director"] as RoleId[] },
  { id: "appetite",    label: "Appetite Rules",icon: ShieldCheck,     path: "/appetite",    roles: ["lead","director"] as RoleId[] },
  { id: "users",       label: "User Management",icon: Users,          path: "/users",       roles: ["director"] as RoleId[] },
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
  onRoleChange,
  search = "",
  onSearchChange,
  children,
}: AppShellProps) {
  const navigate        = useNavigate();
  const { user, logout } = useAuth();
  const [userDrop,        setUserDrop]        = useState(false);
  const [alertPop,        setAlertPop]        = useState(false);
  const [showLogout,      setShowLogout]      = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [quickOpen,       setQuickOpen]       = useState(false);

  const effectiveRoleId: RoleId = user?.roleId ?? roleProp ?? "uw";
  const critAlerts = 2;
  const navItems = NAV_BASE.filter(item => item.roles.includes(effectiveRoleId));

  const handleNav = (item: typeof NAV_BASE[0]) => {
    if (item.id === "dashboard")    navigate("/");
    else if (item.id === "submissions") navigate("/submissions");
    else if (item.id === "inbox")   navigate("/inbox");
    else if (item.id === "tasks")   navigate("/tasks");
    else if (item.id === "portfolio") navigate("/portfolio");
    else if (item.id === "appetite") navigate("/appetite");
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const roleColor = user ? ROLE_COLORS[user.appRole] : ROLE_COLORS["underwriter"];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: font, background: "#EEF1F6" }}
    >
      {/* ── Mobile backdrop ─────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(15,23,42,0.45)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside
        className={[
          "flex flex-col shrink-0",
          "fixed top-0 left-0 bottom-0 z-50",
          "lg:relative lg:top-auto lg:left-auto lg:bottom-auto lg:z-auto",
          "transition-all duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        style={{
          width: sidebarCollapsed ? 64 : 224,
          minWidth: sidebarCollapsed ? 64 : 224,
          background: "white",
          borderRight: `1px solid ${BDL}`,
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Logo + close btn */}
        <div
          className="flex shrink-0"
          style={{
            borderBottom: `1px solid ${BDL}`,
            minHeight: 72,
            flexDirection: sidebarCollapsed ? "column" : "row",
            alignItems: "center",
            padding: sidebarCollapsed ? "12px 0" : "0 16px 0 20px",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: sidebarCollapsed ? 8 : 10,
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 36, height: 36, background: N }}
          >
            <GraduationCap size={20} color={G} />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "0.82rem", fontWeight: 800, color: N, lineHeight: 1.2, letterSpacing: "0.01em" }}>United</p>
              <p style={{ fontSize: "0.82rem", fontWeight: 800, color: N, lineHeight: 1.2, letterSpacing: "0.01em" }}>Educators</p>
            </div>
          )}
          {/* Collapse toggle – desktop only */}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="hidden lg:flex items-center justify-center shrink-0 transition-colors hover:bg-slate-100"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              width: 26, height: 26,
              border: `1px solid ${BDL}`,
              background: "white",
              cursor: "pointer",
            }}
          >
            {sidebarCollapsed
              ? <ChevronsRight size={13} color={TM} />
              : <ChevronsLeft size={13} color={TM} />
            }
          </button>
          {/* Close btn – mobile only */}
          {!sidebarCollapsed && (
            <button
              className="flex items-center justify-center lg:hidden shrink-0"
              onClick={() => setSidebarOpen(false)}
              style={{ width: 26, height: 26, border: `1px solid ${BDL}` }}
            >
              <X size={14} color={TT} />
            </button>
          )}
        </div>

        {/* Role badge */}
        {user && (
          <div className="px-4 pt-4 pb-2 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-w-0"
              style={{ background: roleColor.bg, border: `1px solid ${roleColor.border}`, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}
            >
              <span style={{ color: roleColor.text }}>{roleColor.icon}</span>
              {!sidebarCollapsed && (
                <span style={{ fontSize: "0.60rem", fontWeight: 800, color: roleColor.text, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.roleLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-col py-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                title={sidebarCollapsed ? item.label : undefined}
                className="flex items-center w-full text-left transition-all relative"
                style={{
                  fontSize: "0.84rem",
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "white" : TM,
                  background: isActive ? N : "transparent",
                  borderLeft: isActive ? `3px solid ${G}` : "3px solid transparent",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  gap: sidebarCollapsed ? 0 : 12,
                  padding: sidebarCollapsed ? "12px 0" : "12px 20px",
                }}
              >
                <Icon size={16} style={{ opacity: isActive ? 1 : 0.65 }} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

      </aside>

      {/* ── RIGHT SIDE ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">

        {/* TOP BAR */}
        <header
          className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 lg:px-8 shrink-0"
          style={{ height: 64, background: "white", borderBottom: `1px solid ${BDL}`, zIndex: 10 }}
        >
          {/* Hamburger – mobile only */}
          <button
            className="flex items-center justify-center shrink-0 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ width: 36, height: 36, border: `1px solid ${BD}` }}
          >
            <Menu size={18} color={TM} />
          </button>

          {/* Logo pill – mobile only (when sidebar is hidden) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center shrink-0" style={{ width: 28, height: 28, background: N }}>
              <GraduationCap size={15} color={G} />
            </div>
          </div>

          {/* Search bar – desktop always, mobile as expandable */}
          <div className={`relative flex-1 max-w-md hidden sm:block`}>
            <Search size={15} color={TT} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={e => onSearchChange?.(e.target.value)}
              placeholder="Search submissions, members, IDs…"
              style={{
                width: "100%", paddingLeft: 38, paddingRight: 16,
                paddingTop: 9, paddingBottom: 9,
                border: `1px solid ${BD}`, fontSize: "0.82rem",
                color: "#1A2530", background: "#F4F6FA",
                outline: "none", fontFamily: font,
              }}
            />
          </div>

          {/* Mobile search expand */}
          <button
            className="flex items-center justify-center shrink-0 sm:hidden"
            onClick={() => setSearchOpen(v => !v)}
            style={{ width: 36, height: 36, border: `1px solid ${BD}`, background: searchOpen ? `${N}0C` : "white" }}
          >
            <Search size={16} color={searchOpen ? N : TT} />
          </button>

          <div className="flex-1" />

          {/* Quick Actions */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setQuickOpen(v => !v); setAlertPop(false); setUserDrop(false); }}
              className="flex items-center gap-1.5 px-3 py-2 transition-colors hover:bg-slate-50"
              style={{ border: `1px solid ${BD}`, background: quickOpen ? `${N}0C` : "white" }}
              title="Quick Actions"
            >
              <Plus size={15} color={quickOpen ? N : TM} />
              <span className="hidden sm:inline" style={{ fontSize: "0.74rem", fontWeight: 600, color: quickOpen ? N : TM }}>New</span>
            </button>
            {quickOpen && (
              <div className="absolute right-0 mt-2 z-50"
                style={{ width: 220, background: "white", border: `1px solid ${BD}`, boxShadow: "0 8px 30px rgba(0,0,0,0.14)", top: "100%" }}>
                <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${BDL}`, background: "#F0F3F8" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.07em" }}>Quick Actions</p>
                </div>
                {[
                  { icon: <CheckCircle2 size={14} color={G} />,  label: "Create New Task",      sub: "Add to task queue",      onClick: () => { navigate("/tasks");        setQuickOpen(false); } },
                  { icon: <FileText size={14} color={N} />,      label: "New Quote",             sub: "Start quote builder",    onClick: () => { navigate("/submissions");  setQuickOpen(false); } },
                  { icon: <Send size={14} color="#7B2FBE" />,    label: "Send Templated Email",  sub: "Broker or internal",     onClick: () => { navigate("/inbox");        setQuickOpen(false); } },
                  { icon: <Inbox size={14} color="#2E7D32" />,   label: "New Submission",        sub: "Start intake form",      onClick: () => { navigate("/submissions/new"); setQuickOpen(false); } },
                ].map((a, i) => (
                  <button key={i}
                    onClick={a.onClick}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                    style={{ borderBottom: i < 3 ? `1px solid ${BDL}` : "none" }}>
                    <span className="shrink-0 mt-0.5">{a.icon}</span>
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A2530" }}>{a.label}</p>
                      <p style={{ fontSize: "0.64rem", color: TT }}>{a.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alerts bell */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setAlertPop(v => !v); setUserDrop(false); }}
              className="relative p-2.5 transition-colors hover:bg-slate-50"
              style={{ border: `1px solid ${BD}` }}
            >
              <Bell size={17} color={TM} />
              {critAlerts > 0 && (
                <span
                  className="absolute flex items-center justify-center rounded-full"
                  style={{ top: 4, right: 4, width: 16, height: 16, background: "#B91C1C", fontSize: "0.55rem", fontWeight: 800, color: "white" }}
                >
                  {critAlerts}
                </span>
              )}
            </button>
            {alertPop && (
              <div
                className="absolute right-0 mt-2 z-50"
                style={{ width: 280, background: "white", border: `1px solid ${BD}`, boxShadow: "0 8px 30px rgba(0,0,0,0.14)", top: "100%" }}
              >
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: "#F0F3F8" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.07em" }}>Alerts</p>
                </div>
                {[
                  { title: "Missing: Safety Questionnaire", sub: "SUB-7835 · Seattle PS",    sev: "#B91C1C" },
                  { title: "Review Overdue — 16 Days",      sub: "SUB-7831 · Austin ISD",    sev: "#B91C1C" },
                  { title: "Quote Expiring in 5 Days",      sub: "SUB-7830 · San Diego City", sev: "#B45309" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                    style={{ borderBottom: `1px solid ${BDL}`, borderLeft: `3px solid ${a.sev}` }}
                  >
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A2530" }}>{a.title}</p>
                      <p style={{ fontSize: "0.70rem", color: TT }}>{a.sub}</p>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 text-center" style={{ background: "#F0F3F8" }}>
                  <button style={{ fontSize: "0.70rem", fontWeight: 700, color: "#005B99" }}>View all alerts</button>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          {user && (
            <div className="relative shrink-0">
              <button
                onClick={() => { setUserDrop(v => !v); setAlertPop(false); }}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 transition-colors hover:bg-slate-50"
                style={{ border: `1px solid ${BD}` }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 32, height: 32, background: roleColor.text, color: "white", fontSize: "0.72rem", fontWeight: 800 }}
                >
                  {user.initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p style={{ fontSize: "0.80rem", fontWeight: 700, color: "#1A2530", lineHeight: 1.2 }}>{user.name}</p>
                  <p style={{ fontSize: "0.68rem", color: roleColor.text, fontWeight: 600 }}>{user.roleLabel}</p>
                </div>
                <ChevronDown size={14} color={TT} className="hidden sm:block" />
              </button>

              {userDrop && (
                <div
                  className="absolute right-0 mt-1 z-50"
                  style={{ width: 260, background: "white", border: `1px solid ${BD}`, boxShadow: "0 8px 30px rgba(0,0,0,0.14)", top: "100%" }}
                >
                  <div className="px-4 py-4" style={{ borderBottom: `1px solid ${BDL}`, background: "#F8FAFC" }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{ width: 40, height: 40, background: roleColor.text, color: "white", fontSize: "0.80rem", fontWeight: 800 }}
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
                      style={{ fontSize: "0.78rem", color: "#1A2530" }}>
                      <Settings size={14} color={TT} /> Account Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 transition-colors text-left"
                      style={{ fontSize: "0.78rem", color: "#B91C1C", fontWeight: 600 }}>
                      <LogOut size={14} color="#B91C1C" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Mobile search bar (expands below header) */}
        {searchOpen && (
          <div className="sm:hidden px-3 py-2" style={{ background: "white", borderBottom: `1px solid ${BDL}` }}>
            <div className="relative">
              <Search size={14} color={TT} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                autoFocus
                value={search}
                onChange={e => onSearchChange?.(e.target.value)}
                placeholder="Search submissions, members, IDs…"
                style={{
                  width: "100%", paddingLeft: 32, paddingRight: 32,
                  paddingTop: 8, paddingBottom: 8,
                  border: `1px solid ${BD}`, fontSize: "0.82rem",
                  color: "#1A2530", background: "#F4F6FA",
                  outline: "none", fontFamily: font,
                }}
              />
              {search && (
                <button
                  onClick={() => onSearchChange?.("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}
                >
                  <X size={13} color={TT} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#EEF1F6" }}>
          {children}
        </main>
      </div>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}