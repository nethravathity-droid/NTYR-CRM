import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { RoleSidebar } from "@/components/layout/RoleSidebar";
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNavigationForRole } from "@/lib/rbac/navigation";
import { getRoleDashboardPath, isRoleCode, setActiveRoleCode, type RoleCode } from "@/lib/rbac/roles";
import { useEffect } from "react";

interface AppShellProps {
  roleCode: RoleCode;
}

export function AppShell({ roleCode }: AppShellProps) {
  const { isInitializing, user } = useAuth();
  const navItems = getNavigationForRole(roleCode);
  const dashboardPath = getRoleDashboardPath(roleCode);

  useEffect(() => {
    if (user?.role.code && isRoleCode(user.role.code)) {
      setActiveRoleCode(user.role.code);
    } else {
      setActiveRoleCode(roleCode);
    }
  }, [roleCode, user?.role.code]);

  if (isInitializing) {
    return <Loading fullScreen label="Loading workspace..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar navigation={navItems} dashboardPath={dashboardPath} />
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
