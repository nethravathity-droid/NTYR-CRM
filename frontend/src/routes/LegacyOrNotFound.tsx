import { Navigate, useLocation } from "react-router-dom";
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NotFoundPage } from "@/pages/NotFoundPage";
import {
  getRoleDashboardPath,
  getRoleRoutePrefix,
  ROLE_ROUTE_PREFIX,
} from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

const PUBLIC_PATHS = [paths.login, paths.forbidden] as string[];

function hasRolePrefix(pathname: string): boolean {
  return Object.values(ROLE_ROUTE_PREFIX).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isLegacyAppPath(pathname: string): boolean {
  if (pathname === "/" || PUBLIC_PATHS.includes(pathname)) {
    return false;
  }

  return !hasRolePrefix(pathname);
}

export function LegacyOrNotFound() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <Loading fullScreen label="Loading..." />;
  }

  if (!isLegacyAppPath(pathname)) {
    return <NotFoundPage />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={paths.login} replace state={{ from: { pathname } }} />;
  }

  const prefix = getRoleRoutePrefix(user.role.code);
  if (!prefix) {
    return <Navigate to={paths.forbidden} replace />;
  }

  return <Navigate to={`${prefix}${pathname}`} replace />;
}

export function RoleWorkspaceFallback() {
  const { user } = useAuth();
  return <Navigate to={getRoleDashboardPath(user?.role.code)} replace />;
}
