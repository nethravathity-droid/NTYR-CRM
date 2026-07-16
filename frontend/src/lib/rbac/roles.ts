export const ROLE_CODES = {
  PLATFORM_SUPER_ADMIN: "PLATFORM_SUPER_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  MANAGER: "MANAGER",
  TELECALLER: "TELECALLER",
  SALES_EXECUTIVE: "SALES_EXECUTIVE",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const ROLE_ROUTE_PREFIX: Record<RoleCode, string> = {
  [ROLE_CODES.PLATFORM_SUPER_ADMIN]: "/super-admin",
  [ROLE_CODES.COMPANY_ADMIN]: "/admin",
  [ROLE_CODES.MANAGER]: "/manager",
  [ROLE_CODES.TELECALLER]: "/telecaller",
  [ROLE_CODES.SALES_EXECUTIVE]: "/sales",
};

export function isRoleCode(value: string | undefined): value is RoleCode {
  return Boolean(value && value in ROLE_ROUTE_PREFIX);
}

export function getRoleRoutePrefix(roleCode: string | undefined): string | null {
  if (!isRoleCode(roleCode)) {
    return null;
  }

  return ROLE_ROUTE_PREFIX[roleCode];
}

export function getRoleDashboardPath(roleCode: string | undefined): string {
  const prefix = getRoleRoutePrefix(roleCode);

  if (!prefix) {
    return "/forbidden";
  }

  return `${prefix}/dashboard`;
}

export function isPathAllowedForRole(pathname: string, roleCode: string | undefined): boolean {
  const prefix = getRoleRoutePrefix(roleCode);

  if (!prefix) {
    return false;
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

let activeRoleCode: RoleCode = ROLE_CODES.COMPANY_ADMIN;

export function setActiveRoleCode(roleCode: string | undefined): void {
  if (isRoleCode(roleCode)) {
    activeRoleCode = roleCode;
  }
}

export function getActiveRoleCode(): RoleCode {
  return activeRoleCode;
}

export function rolePath(segment: string): string {
  const prefix = ROLE_ROUTE_PREFIX[activeRoleCode];
  return `${prefix}${segment}`;
}
