import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getRoleDashboardPath } from "@/lib/rbac/roles";
import type { ReactNode } from "react";
import { paths } from "@/routes/paths";

interface PermissionRouteProps {
  permission: string;
  children: ReactNode;
}

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();

  if (!hasPermission(permission)) {
    return (
      <Navigate
        to={paths.forbidden}
        replace
        state={{ from: location, requiredPermission: permission, role: user?.role.code }}
      />
    );
  }

  return children;
}
