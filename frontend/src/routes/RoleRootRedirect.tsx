import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

export function RoleRootRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  return <Navigate to={getRoleDashboardPath(user.role.code)} replace />;
}
