import type { RoleCode } from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

export type CommandItem = {
  id: string;
  label: string;
  group: string;
  href: string;
  permission?: string;
  keywords?: string;
};

function baseItems(): CommandItem[] {
  return [
    { id: "dashboard", label: "Dashboard", group: "Navigation", href: paths.dashboard },
    { id: "settings", label: "Settings", group: "Navigation", href: paths.settings },
  ];
}

export function getCommandItemsForRole(roleCode: RoleCode): CommandItem[] {
  const items = [...baseItems()];

  switch (roleCode) {
    case "PLATFORM_SUPER_ADMIN":
      items.push(
        { id: "companies", label: "Companies", group: "Platform", href: paths.companies.list, permission: "companies.view" },
        { id: "subscriptions", label: "Subscriptions", group: "Platform", href: paths.platform.subscriptions, permission: "companies.view" },
        { id: "activity", label: "Activity Log", group: "Platform", href: paths.platform.activityLog, permission: "companies.view" },
        { id: "analytics", label: "Platform Analytics", group: "Platform", href: paths.platform.analytics, permission: "companies.view" },
      );
      break;
    case "COMPANY_ADMIN":
      items.push(
        { id: "leads", label: "Leads", group: "CRM", href: paths.leads.list, permission: "leads.view", keywords: "pipeline customers" },
        { id: "add-lead", label: "Add Lead", group: "Quick Actions", href: paths.leads.create, permission: "leads.create" },
        { id: "calls", label: "Calls", group: "CRM", href: paths.calls.dashboard, permission: "calls.view" },
        { id: "followups", label: "Follow-ups", group: "CRM", href: paths.followups.list, permission: "leads.view" },
        { id: "projects", label: "Projects", group: "Inventory", href: paths.projects.list, permission: "projects.view" },
        { id: "inventory", label: "Inventory", group: "Inventory", href: paths.projects.inventory, permission: "projects.view" },
        { id: "visits", label: "Visits", group: "Sales", href: paths.visits.list, permission: "visits.view" },
        { id: "bookings", label: "Bookings", group: "Sales", href: paths.bookings.list, permission: "bookings.view" },
        { id: "payments", label: "Payments", group: "Finance", href: paths.payments.dashboard, permission: "payments.view" },
        { id: "employees", label: "Employees", group: "People", href: paths.employees.list, permission: "users.view" },
        { id: "reports", label: "Reports", group: "Analytics", href: paths.reports.dashboard, permission: "reports.view" },
        { id: "assign-lead", label: "Assign Lead", group: "Quick Actions", href: paths.leads.assign, permission: "leads.update" },
        { id: "schedule-visit", label: "Schedule Visit", group: "Quick Actions", href: paths.visits.create, permission: "visits.create" },
        { id: "create-booking", label: "Create Booking", group: "Quick Actions", href: paths.bookings.create, permission: "bookings.create" },
        { id: "receive-payment", label: "Receive Payment", group: "Quick Actions", href: paths.payments.create, permission: "payments.create" },
      );
      break;
    case "MANAGER":
      items.push(
        { id: "leads", label: "Leads", group: "CRM", href: paths.leads.list, permission: "leads.view" },
        { id: "calls", label: "Calls", group: "CRM", href: paths.calls.dashboard, permission: "calls.view" },
        { id: "followups", label: "Follow-ups", group: "CRM", href: paths.followups.today, permission: "leads.view" },
        { id: "reports", label: "Team Reports", group: "Analytics", href: paths.reports.employees, permission: "reports.view" },
        { id: "bookings", label: "Bookings", group: "Sales", href: paths.bookings.list, permission: "bookings.view" },
        { id: "payments", label: "Collections", group: "Finance", href: paths.payments.dashboard, permission: "payments.view" },
      );
      break;
    case "TELECALLER":
      items.push(
        { id: "leads", label: "My Leads", group: "CRM", href: paths.leads.list, permission: "leads.view" },
        { id: "calls", label: "Calls", group: "CRM", href: paths.calls.list, permission: "calls.view" },
        { id: "log-call", label: "Log Call", group: "Quick Actions", href: paths.calls.create, permission: "calls.create" },
        { id: "followups", label: "Follow-ups", group: "CRM", href: paths.followups.today, permission: "leads.view" },
        { id: "schedule-followup", label: "Schedule Follow-up", group: "Quick Actions", href: paths.followups.create, permission: "leads.create" },
      );
      break;
    case "SALES_EXECUTIVE":
      items.push(
        { id: "visits", label: "Visits", group: "Sales", href: paths.visits.list, permission: "visits.view" },
        { id: "schedule-visit", label: "Schedule Visit", group: "Quick Actions", href: paths.visits.create, permission: "visits.create" },
        { id: "bookings", label: "Bookings", group: "Sales", href: paths.bookings.list, permission: "bookings.view" },
        { id: "payments", label: "Collections", group: "Finance", href: paths.payments.list, permission: "payments.view" },
        { id: "leads", label: "Leads", group: "CRM", href: paths.leads.list, permission: "leads.view" },
      );
      break;
  }

  return items;
}
