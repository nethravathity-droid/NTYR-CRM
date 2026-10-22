const RESTRICTED_ROLES = new Set(["TELECALLER", "SALES_EXECUTIVE"]);

export function shouldRestrictToOwnRecords(roleCode: string): boolean {
  return RESTRICTED_ROLES.has(roleCode);
}

export function withAssignedUserScope<T extends { assignedUserId?: number }>(
  roleCode: string,
  userId: number,
  query: T,
): T {
  if (shouldRestrictToOwnRecords(roleCode) && !query.assignedUserId) {
    return { ...query, assignedUserId: userId };
  }
  return query;
}

export function withSalesExecutiveBookingScope<T extends { salesExecutiveUserId?: number }>(
  roleCode: string,
  userId: number,
  query: T,
): T {
  if (roleCode === "SALES_EXECUTIVE" && !query.salesExecutiveUserId) {
    return { ...query, salesExecutiveUserId: userId };
  }
  return query;
}
