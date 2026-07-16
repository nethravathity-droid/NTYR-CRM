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
    { id: "dashboard", label: "Dashboard", group: "Navigation", href: paths.dashboard, keywords: "home overview analytics" },
    { id: "settings", label: "Settings", group: "Navigation", href: paths.settings, keywords: "profile preferences account" },
  ];
}

export function getCommandItemsForRole(roleCode: RoleCode): CommandItem[] {
  const items = [...baseItems()];

  switch (roleCode) {
    case "PLATFORM_SUPER_ADMIN":
      items.push(
        { id: "companies", label: "Companies", group: "Platform", href: paths.companies.list, permission: "companies.view", keywords: "tenants organizations clients" },
        { id: "subscriptions", label: "Subscriptions", group: "Platform", href: paths.platform.subscriptions, permission: "companies.view", keywords: "billing plans renewals" },
        { id: "activity", label: "Activity Log", group: "Platform", href: paths.platform.activityLog, permission: "companies.view", keywords: "audit history events" },
        { id: "analytics", label: "Platform Analytics", group: "Platform", href: paths.platform.analytics, permission: "companies.view", keywords: "metrics stats reports" },
      );
      break;
    case "COMPANY_ADMIN":
      items.push(
        { id: "leads", label: "Leads", group: "CRM", href: paths.leads.list, permission: "leads.view", keywords: "pipeline customers prospects inquiries" },
        { id: "add-lead", label: "Add Lead", group: "Quick Actions", href: paths.leads.create, permission: "leads.create", keywords: "new lead create customer" },
        { id: "calls", label: "Calls", group: "CRM", href: paths.calls.dashboard, permission: "calls.view", keywords: "phone telecaller dial log" },
        { id: "followups", label: "Follow-ups", group: "CRM", href: paths.followups.list, permission: "leads.view", keywords: "reminders tasks schedule callback" },
        { id: "projects", label: "Projects", group: "Inventory", href: paths.projects.list, permission: "projects.view", keywords: "properties developments sites" },
        { id: "inventory", label: "Inventory", group: "Inventory", href: paths.projects.inventory, permission: "projects.view", keywords: "units flats plots stock availability" },
        { id: "visits", label: "Visits", group: "Sales", href: paths.visits.list, permission: "visits.view", keywords: "site visit schedule appointment" },
        { id: "bookings", label: "Bookings", group: "Sales", href: paths.bookings.list, permission: "bookings.view", keywords: "deals reservations sales orders" },
        { id: "payments", label: "Payments", group: "Finance", href: paths.payments.dashboard, permission: "payments.view", keywords: "collections receipts finance dues" },
        { id: "employees", label: "Employees", group: "People", href: paths.employees.list, permission: "users.view", keywords: "staff team users hr" },
        { id: "reports", label: "Reports", group: "Analytics", href: paths.reports.dashboard, permission: "reports.view", keywords: "analytics performance insights" },
        { id: "assign-lead", label: "Assign Lead", group: "Quick Actions", href: paths.leads.assign, permission: "leads.update", keywords: "transfer allocate lead owner" },
        { id: "schedule-visit", label: "Schedule Visit", group: "Quick Actions", href: paths.visits.create, permission: "visits.create", keywords: "book visit site tour" },
        { id: "create-booking", label: "Create Booking", group: "Quick Actions", href: paths.bookings.create, permission: "bookings.create", keywords: "new booking deal" },
        { id: "receive-payment", label: "Receive Payment", group: "Quick Actions", href: paths.payments.create, permission: "payments.create", keywords: "collect payment receipt" },
      );
      break;
    case "MANAGER":
      items.push(
        { id: "leads", label: "Leads", group: "CRM", href: paths.leads.list, permission: "leads.view", keywords: "pipeline customers team" },
        { id: "calls", label: "Calls", group: "CRM", href: paths.calls.dashboard, permission: "calls.view", keywords: "phone telecaller team calls" },
        { id: "followups", label: "Follow-ups", group: "CRM", href: paths.followups.today, permission: "leads.view", keywords: "reminders tasks today overdue" },
        { id: "reports", label: "Team Reports", group: "Analytics", href: paths.reports.employees, permission: "reports.view", keywords: "performance team analytics" },
        { id: "bookings", label: "Bookings", group: "Sales", href: paths.bookings.list, permission: "bookings.view", keywords: "deals reservations sales" },
        { id: "payments", label: "Collections", group: "Finance", href: paths.payments.dashboard, permission: "payments.view", keywords: "payments receipts dues" },
      );
      break;
    case "TELECALLER":
      items.push(
        { id: "leads", label: "My Leads", group: "CRM", href: paths.leads.list, permission: "leads.view", keywords: "assigned customers prospects" },
        { id: "calls", label: "Calls", group: "CRM", href: paths.calls.list, permission: "calls.view", keywords: "phone dial log history" },
        { id: "log-call", label: "Log Call", group: "Quick Actions", href: paths.calls.create, permission: "calls.create", keywords: "record call phone" },
        { id: "followups", label: "Follow-ups", group: "CRM", href: paths.followups.today, permission: "leads.view", keywords: "reminders callback schedule" },
        { id: "schedule-followup", label: "Schedule Follow-up", group: "Quick Actions", href: paths.followups.create, permission: "leads.create", keywords: "reminder task callback" },
      );
      break;
    case "SALES_EXECUTIVE":
      items.push(
        { id: "visits", label: "Visits", group: "Sales", href: paths.visits.list, permission: "visits.view", keywords: "site visit appointment tour" },
        { id: "schedule-visit", label: "Schedule Visit", group: "Quick Actions", href: paths.visits.create, permission: "visits.create", keywords: "book visit site" },
        { id: "bookings", label: "Bookings", group: "Sales", href: paths.bookings.list, permission: "bookings.view", keywords: "deals reservations" },
        { id: "payments", label: "Collections", group: "Finance", href: paths.payments.list, permission: "payments.view", keywords: "payments receipts collect" },
        { id: "leads", label: "Leads", group: "CRM", href: paths.leads.list, permission: "leads.view", keywords: "customers prospects pipeline" },
      );
      break;
  }

  return items;
}
