import {
  Activity,
  BarChart3,
  Banknote,
  Building2,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  Package,
  PhoneCall,
  Settings,
  UserSquare2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROLE_CODES, type RoleCode, rolePath } from "@/lib/rbac/roles";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string | null;
  disabled?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

const dashboard = (): NavItem => ({
  label: "Dashboard",
  href: rolePath("/dashboard"),
  icon: LayoutDashboard,
  permission: null,
});

export function getNavigationSectionsForRole(roleCode: RoleCode): NavSection[] {
  switch (roleCode) {
    case ROLE_CODES.PLATFORM_SUPER_ADMIN:
      return [
        {
          title: "Platform",
          items: [
            dashboard(),
            { label: "Companies", href: rolePath("/companies"), icon: Building2, permission: "companies.view" },
            { label: "Subscriptions", href: rolePath("/subscriptions"), icon: CreditCard, permission: "companies.view" },
            { label: "Activity Log", href: rolePath("/activity-log"), icon: Activity, permission: "companies.view" },
            { label: "Analytics", href: rolePath("/analytics"), icon: BarChart3, permission: "companies.view" },
          ],
        },
        {
          title: "System",
          items: [
            { label: "Settings", href: rolePath("/settings"), icon: Settings, permission: null },
          ],
        },
      ];

    case ROLE_CODES.COMPANY_ADMIN:
      return [
        {
          title: "Overview",
          items: [dashboard()],
        },
        {
          title: "CRM",
          items: [
            { label: "Leads", href: rolePath("/leads"), icon: UserSquare2, permission: "leads.view" },
            { label: "Calls", href: rolePath("/calls"), icon: PhoneCall, permission: "calls.view" },
            { label: "Follow-ups", href: rolePath("/followups"), icon: CalendarClock, permission: "leads.view" },
          ],
        },
        {
          title: "Sales & Inventory",
          items: [
            { label: "Projects", href: rolePath("/projects"), icon: Building2, permission: "projects.view" },
            { label: "Inventory", href: rolePath("/projects/inventory"), icon: Package, permission: "projects.view" },
            { label: "Visits", href: rolePath("/visits"), icon: MapPinned, permission: "visits.view" },
            { label: "Bookings", href: rolePath("/bookings"), icon: CreditCard, permission: "bookings.view" },
            { label: "Payments", href: rolePath("/payments"), icon: Banknote, permission: "payments.view" },
          ],
        },
        {
          title: "People & Insights",
          items: [
            { label: "Employees", href: rolePath("/employees"), icon: Users, permission: "users.view" },
            { label: "Reports", href: rolePath("/reports"), icon: BarChart3, permission: "reports.view" },
          ],
        },
        {
          title: "Workspace",
          items: [
            { label: "Settings", href: rolePath("/settings"), icon: Settings, permission: null },
          ],
        },
      ];

    case ROLE_CODES.MANAGER:
      return [
        {
          title: "Team",
          items: [
            dashboard(),
            { label: "Leads", href: rolePath("/leads"), icon: UserSquare2, permission: "leads.view" },
            { label: "Calls", href: rolePath("/calls"), icon: PhoneCall, permission: "calls.view" },
            { label: "Follow-ups", href: rolePath("/followups"), icon: CalendarClock, permission: "leads.view" },
          ],
        },
        {
          title: "Pipeline",
          items: [
            { label: "Projects", href: rolePath("/projects"), icon: Building2, permission: "projects.view" },
            { label: "Visits", href: rolePath("/visits"), icon: MapPinned, permission: "visits.view" },
            { label: "Bookings", href: rolePath("/bookings"), icon: CreditCard, permission: "bookings.view" },
            { label: "Payments", href: rolePath("/payments"), icon: Banknote, permission: "payments.view" },
            { label: "Reports", href: rolePath("/reports"), icon: BarChart3, permission: "reports.view" },
          ],
        },
        {
          title: "Workspace",
          items: [
            { label: "Settings", href: rolePath("/settings"), icon: Settings, permission: null },
          ],
        },
      ];

    case ROLE_CODES.TELECALLER:
      return [
        {
          title: "My Desk",
          items: [
            dashboard(),
            { label: "My Leads", href: rolePath("/leads"), icon: UserSquare2, permission: "leads.view" },
            { label: "Calls", href: rolePath("/calls"), icon: PhoneCall, permission: "calls.view" },
            { label: "Follow-ups", href: rolePath("/followups/today"), icon: CalendarClock, permission: "leads.view" },
          ],
        },
        {
          title: "Workspace",
          items: [
            { label: "Settings", href: rolePath("/settings"), icon: Settings, permission: null },
          ],
        },
      ];

    case ROLE_CODES.SALES_EXECUTIVE:
      return [
        {
          title: "Sales",
          items: [
            dashboard(),
            { label: "Leads", href: rolePath("/leads"), icon: UserSquare2, permission: "leads.view" },
            { label: "Calls", href: rolePath("/calls"), icon: PhoneCall, permission: "calls.view" },
            { label: "Follow-ups", href: rolePath("/followups"), icon: CalendarClock, permission: "leads.view" },
            { label: "Visits", href: rolePath("/visits"), icon: MapPinned, permission: "visits.view" },
            { label: "Bookings", href: rolePath("/bookings"), icon: CreditCard, permission: "bookings.view" },
            { label: "Payments", href: rolePath("/payments"), icon: Banknote, permission: "payments.view" },
          ],
        },
        {
          title: "Workspace",
          items: [
            { label: "Settings", href: rolePath("/settings"), icon: Settings, permission: null },
          ],
        },
      ];

    default:
      return [{ title: "Main", items: [dashboard()] }];
  }
}

/** @deprecated use getNavigationSectionsForRole */
export function getNavigationForRole(roleCode: RoleCode): NavItem[] {
  return getNavigationSectionsForRole(roleCode).flatMap((section) => section.items);
}

export function getWorkspaceLabel(roleCode: RoleCode): string {
  switch (roleCode) {
    case ROLE_CODES.PLATFORM_SUPER_ADMIN:
      return "Platform Control";
    case ROLE_CODES.COMPANY_ADMIN:
      return "Company Admin";
    case ROLE_CODES.MANAGER:
      return "Manager Workspace";
    case ROLE_CODES.TELECALLER:
      return "Telecaller Desk";
    case ROLE_CODES.SALES_EXECUTIVE:
      return "Sales Workspace";
    default:
      return "Workspace";
  }
}
