import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { PremiumHeader } from "@/components/premium/PremiumHeader";
import { PremiumSidebar } from "@/components/premium/PremiumSidebar";
import { Loading } from "@/components/shared/Loading";
import { ShellProvider, useShell } from "@/context/ShellContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNavigationSectionsForRole, getWorkspaceLabel } from "@/lib/rbac/navigation";
import { getRoleDashboardPath, isRoleCode, setActiveRoleCode, type RoleCode } from "@/lib/rbac/roles";
import { cn } from "@/lib/utils";

interface AppShellProps {
  roleCode: RoleCode;
}

function AppShellInner({ roleCode }: AppShellProps) {
  const { isInitializing, user } = useAuth();
  const { sidebarCollapsed } = useShell();
  const sections = getNavigationSectionsForRole(roleCode);
  const dashboardPath = getRoleDashboardPath(roleCode);
  const workspaceLabel = user?.company.name ?? getWorkspaceLabel(roleCode);

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
    <div className="premium-shell">
      <PremiumSidebar sections={sections} dashboardPath={dashboardPath} workspaceLabel={workspaceLabel} />

      <div
        className={cn(
          "shell-main",
          sidebarCollapsed ? "shell-main-collapsed" : "shell-main-expanded",
        )}
      >
        <PremiumHeader />
        <main className="shell-content px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppShell({ roleCode }: AppShellProps) {
  return (
    <ShellProvider>
      <AppShellInner roleCode={roleCode} />
    </ShellProvider>
  );
}
