import type { Permission } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Login removed — all routes are accessible without authentication
  return <>{children}</>;
}