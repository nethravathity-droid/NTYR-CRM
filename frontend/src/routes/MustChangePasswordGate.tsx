import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Renders children only when the signed-in user does NOT need a forced
 * password change; otherwise redirects to the change-password screen.
 */
export function MustChangePasswordGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user?.user?.mustChangePassword) {
    return <Navigate to="/force-change-password" replace />;
  }

  return children;
}
