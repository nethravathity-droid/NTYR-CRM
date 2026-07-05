import { Navigate, Outlet, useLocation } from "react-router-dom";
import { env } from "@/config/env";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Loading } from "@/components/shared/Loading";
import { paths } from "@/routes/paths";

export function AuthLayout() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();
  const redirectPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? paths.dashboard;

  if (isInitializing) {
    return <Loading fullScreen label="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10 lg:flex-row lg:justify-between">
        <div className="max-w-xl space-y-4 text-center lg:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Multi-Tenant CRM
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {env.VITE_APP_NAME}
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage leads, teams, visits, bookings, and payments from one secure
            SaaS platform built for real estate companies.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
