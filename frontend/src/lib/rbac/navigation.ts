import {
  BarChart3,
  Banknote,
  Building2,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  PhoneCall,
  Users,
  UserSquare2,
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

function dashboardItem(): NavItem {
  return {
    label: "Dashboard",
    href: rolePath("/dashboard"),
    icon: LayoutDashboard,
    permission: null,
  };
}

const companiesItem = (): NavItem => ({
  label: "Companies",
  href: rolePath("/companies"),
  icon: Building2,
  permission: "companies.view",
});

const usersItem = (): NavItem => ({
  label: "Users",
  href: rolePath("/employees"),
  icon: Users,
  permission: "users.view",
});

const leadsItem = (): NavItem => ({
  label: "Leads",
  href: rolePath("/leads"),
  icon: UserSquare2,
  permission: "leads.view",
});

const followupsItem = (): NavItem => ({
  label: "Follow-ups",
  href: rolePath("/followups"),
  icon: CalendarClock,
  permission: "leads.view",
});

const projectsItem = (): NavItem => ({
  label: "Projects",
  href: rolePath("/projects"),
  icon: Building2,
  permission: "projects.view",
});

const visitsItem = (): NavItem => ({
  label: "Visits",
  href: rolePath("/visits"),
  icon: MapPinned,
  permission: "visits.view",
});

const bookingsItem = (): NavItem => ({
  label: "Bookings",
  href: rolePath("/bookings"),
  icon: CreditCard,
  permission: "bookings.view",
});

const paymentsItem = (): NavItem => ({
  label: "Payments",
  href: rolePath("/payments"),
  icon: Banknote,
  permission: "payments.view",
});

const callsItem = (): NavItem => ({
  label: "Calls",
  href: rolePath("/calls"),
  icon: PhoneCall,
  permission: "calls.view",
});

const reportsItem = (): NavItem => ({
  label: "Reports",
  href: rolePath("/reports"),
  icon: BarChart3,
  permission: "reports.view",
});

export function getNavigationForRole(roleCode: RoleCode): NavItem[] {
  switch (roleCode) {
    case ROLE_CODES.PLATFORM_SUPER_ADMIN:
      return [dashboardItem(), companiesItem()];
    case ROLE_CODES.COMPANY_ADMIN:
      return [
        dashboardItem(),
        usersItem(),
        leadsItem(),
        followupsItem(),
        projectsItem(),
        visitsItem(),
        bookingsItem(),
        paymentsItem(),
        reportsItem(),
        callsItem(),
      ];
    case ROLE_CODES.MANAGER:
      return [
        dashboardItem(),
        leadsItem(),
        followupsItem(),
        callsItem(),
        projectsItem(),
        visitsItem(),
        bookingsItem(),
        paymentsItem(),
        reportsItem(),
      ];
    case ROLE_CODES.TELECALLER:
      return [dashboardItem(), leadsItem(), followupsItem(), callsItem()];
    case ROLE_CODES.SALES_EXECUTIVE:
      return [
        dashboardItem(),
        leadsItem(),
        followupsItem(),
        callsItem(),
        visitsItem(),
        bookingsItem(),
        paymentsItem(),
      ];
    default:
      return [dashboardItem()];
  }
}
