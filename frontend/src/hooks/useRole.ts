import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleDashboardPath, isRoleCode } from "@/lib/rbac/roles";

export function useRole() {
  const { user } = useAuth();
  const roleCode = user?.role.code;

  return {
    roleCode,
    roleName: user?.role.name ?? null,
    isSuperAdmin: roleCode === "PLATFORM_SUPER_ADMIN",
    isCompanyAdmin: roleCode === "COMPANY_ADMIN",
    isManager: roleCode === "MANAGER",
    isTelecaller: roleCode === "TELECALLER",
    isSalesExecutive: roleCode === "SALES_EXECUTIVE",
    dashboardPath: getRoleDashboardPath(roleCode),
    isKnownRole: isRoleCode(roleCode),
  };
}
