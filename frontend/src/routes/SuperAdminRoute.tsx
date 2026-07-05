import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paths } from "@/routes/paths";

interface SuperAdminRouteProps {
  children: ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user } = useAuth();

  if (user?.role.code !== "PLATFORM_SUPER_ADMIN") {
    return <Navigate to={paths.dashboard} replace />;
  }

  return children;
}
