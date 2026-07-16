import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleDashboardPath, isPathAllowedForRole, type RoleCode } from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

interface RoleRouteProps {
  allowedRoles: RoleCode[];
  children: ReactNode;
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
  const roleCode = user?.role.code;

  if (!roleCode || !allowedRoles.includes(roleCode as RoleCode)) {
    if (user) {
      return <Navigate to={getRoleDashboardPath(roleCode)} replace state={{ from: location }} />;
    }

    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  if (!isPathAllowedForRole(location.pathname, roleCode)) {
    return <Navigate to={getRoleDashboardPath(roleCode)} replace />;
  }

  return children;
}
