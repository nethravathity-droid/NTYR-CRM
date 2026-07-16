import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppShell } from "@/layouts/AppShell";
import { ROLE_CODES, isRoleCode } from "@/lib/rbac/roles";

export function ForbiddenLayout() {
  const { user } = useAuth();
  const roleCode = isRoleCode(user?.role.code)
    ? user.role.code
    : ROLE_CODES.COMPANY_ADMIN;

  return <AppShell roleCode={roleCode} />;
}
