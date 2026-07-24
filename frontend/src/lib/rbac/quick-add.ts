import { ROLE_CODES } from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

export type QuickAddItem = {
  label: string;
  href: string;
};

type PermissionChecker = (permission: string) => boolean;

function companyWorkspaceItems(hasPermission: PermissionChecker): QuickAddItem[] {
  return [
    hasPermission("leads.create") ? { label: "Add Lead", href: paths.leads.create } : null,
    hasPermission("leads.create")
      ? { label: "Add Customer", href: `${paths.leads.list}?tab=customers` }
      : null,
    hasPermission("leads.create") ? { label: "Schedule Follow-up", href: paths.followups.create } : null,
    hasPermission("visits.create") ? { label: "Schedule Visit", href: paths.visits.create } : null,
    hasPermission("bookings.create") ? { label: "Create Booking", href: paths.bookings.create } : null,
    hasPermission("payments.create") ? { label: "Receive Payment", href: paths.payments.create } : null,
    hasPermission("users.create") ? { label: "Add Employee", href: paths.employees.create } : null,
    hasPermission("projects.create") ? { label: "Add Property", href: paths.projects.create } : null,
  ].filter(Boolean) as QuickAddItem[];
}

function platformQuickAddItems(hasPermission: PermissionChecker): QuickAddItem[] {
  return [
    hasPermission("companies.create") ? { label: "Add Company", href: paths.companies.create } : null,
    hasPermission("companies.view") ? { label: "Manage Companies", href: paths.companies.list } : null,
    hasPermission("companies.view") ? { label: "Subscriptions", href: paths.platform.subscriptions } : null,
    hasPermission("companies.view") ? { label: "Activity Log", href: paths.platform.activityLog } : null,
    hasPermission("companies.view") ? { label: "Platform Analytics", href: paths.platform.analytics } : null,
  ].filter(Boolean) as QuickAddItem[];
}

export function getQuickAddItemsForRole(
  roleCode: string | undefined,
  hasPermission: PermissionChecker,
): QuickAddItem[] {
  if (roleCode === ROLE_CODES.PLATFORM_SUPER_ADMIN) {
    return platformQuickAddItems(hasPermission);
  }

  return companyWorkspaceItems(hasPermission);
}
