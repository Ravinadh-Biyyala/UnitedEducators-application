import { createContext, useContext, useState, ReactNode } from "react";

// ─── Role definitions ─────────────────────────────────────────────────────────
export type AppRole = "underwriter" | "uw_manager" | "admin";
export type RoleId  = "uw" | "sr-uw" | "lead" | "director";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  appRole: AppRole;
  roleId: RoleId;       // maps to AppShell RoleId
  roleLabel: string;    // display label
  dept: string;
  team: string;
  avatar?: string;
  permissions: Permission[];
}

export type Permission =
  | "view_all_submissions"
  | "view_team_submissions"
  | "view_own_submissions"
  | "assign_submissions"
  | "approve_quotes"
  | "bind_policy"
  | "manage_users"
  | "view_reports"
  | "view_appetite_rules"
  | "edit_appetite_rules"
  | "view_admin_settings";

// ─── Demo users ───────────────────────────────────────────────────────────────
const DEMO_USERS: (AuthUser & { password: string })[] = [
  {
    id: "u1",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@ue.org",
    password: "ue2024!",
    initials: "SM",
    appRole: "underwriter",
    roleId: "uw",
    roleLabel: "Underwriter",
    dept: "Education Practice",
    team: "Team Alpha",
    permissions: [
      "view_own_submissions",
      "view_reports",
      "bind_policy",
    ],
  },
  {
    id: "u2",
    name: "John Michaels",
    email: "john.michaels@ue.org",
    password: "ue2024!",
    initials: "JM",
    appRole: "underwriter",
    roleId: "sr-uw",
    roleLabel: "Sr. Underwriter",
    dept: "Education Practice",
    team: "Team Alpha",
    permissions: [
      "view_own_submissions",
      "view_team_submissions",
      "view_reports",
      "bind_policy",
      "view_appetite_rules",
    ],
  },
  {
    id: "u3",
    name: "Patricia Hoffman",
    email: "patricia.hoffman@ue.org",
    password: "ue2024!",
    initials: "PH",
    appRole: "uw_manager",
    roleId: "lead",
    roleLabel: "UW Manager",
    dept: "Education Practice",
    team: "Team Alpha",
    permissions: [
      "view_own_submissions",
      "view_team_submissions",
      "view_all_submissions",
      "assign_submissions",
      "approve_quotes",
      "bind_policy",
      "view_reports",
      "view_appetite_rules",
    ],
  },
  {
    id: "u4",
    name: "Robert Chen",
    email: "robert.chen@ue.org",
    password: "ue2024!",
    initials: "RC",
    appRole: "admin",
    roleId: "director",
    roleLabel: "UW Director / Admin",
    dept: "UW Division",
    team: "All Teams",
    permissions: [
      "view_own_submissions",
      "view_team_submissions",
      "view_all_submissions",
      "assign_submissions",
      "approve_quotes",
      "bind_policy",
      "manage_users",
      "view_reports",
      "view_appetite_rules",
      "edit_appetite_rules",
      "view_admin_settings",
    ],
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (p: Permission) => boolean;
}

// Default user (John Michaels, Sr. Underwriter) used as fallback when no Provider is present
const DEFAULT_USER: AuthUser = {
  id: "u2",
  name: "John Michaels",
  email: "john.michaels@ue.org",
  initials: "JM",
  appRole: "underwriter",
  roleId: "sr-uw",
  roleLabel: "Sr. Underwriter",
  dept: "Education Practice",
  team: "Team Alpha",
  permissions: [
    "view_own_submissions",
    "view_team_submissions",
    "view_reports",
    "bind_policy",
    "view_appetite_rules",
  ],
};

const DEFAULT_CONTEXT: AuthContextValue = {
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: async () => ({ success: true }),
  logout: () => {},
  hasPermission: (p: Permission) => DEFAULT_USER.permissions.includes(p),
};

const AuthContext = createContext<AuthContextValue>(DEFAULT_CONTEXT);

const SESSION_KEY = "ue_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );
    if (!found) return { success: false, error: "Invalid email or password." };
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return { success: true };
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const hasPermission = (p: Permission) => user?.permissions.includes(p) ?? false;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { DEMO_USERS };