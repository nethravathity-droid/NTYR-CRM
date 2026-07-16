import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/rbac/roles";
import { ROLE_CODES } from "@/lib/rbac/roles";

interface SuperAdminRouteProps {
  children: ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user } = useAuth();

  if (user?.role.code !== ROLE_CODES.PLATFORM_SUPER_ADMIN) {
    return <Navigate to={getRoleDashboardPath(user?.role.code)} replace />;
  }

  return children;
}
