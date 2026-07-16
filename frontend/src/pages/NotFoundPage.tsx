import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

export function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const dashboardPath = isAuthenticated ? getRoleDashboardPath(user?.role.code) : paths.login;

  if (isAuthenticated && user) {
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild>
        <Link to={dashboardPath}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
