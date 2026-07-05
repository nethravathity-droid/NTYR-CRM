import { useAuth } from "@/features/auth/hooks/useAuth";

export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const hasPermission = (permission: string) =>
    permissions.includes(permission);

  const hasAnyPermission = (required: string[]) =>
    required.some((permission) => permissions.includes(permission));

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
  };
}
