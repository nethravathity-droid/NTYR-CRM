import { NavLink } from "react-router-dom";
import {
  Building2,
  Banknote,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  PhoneCall,
  Users,
  UserSquare2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission: string | null;
  disabled: boolean;
};

const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: paths.dashboard,
    icon: LayoutDashboard,
    permission: null,
    disabled: false,
  },
  {
    label: "Companies",
    href: paths.companies.list,
    icon: Building2,
    permission: "companies.view",
    disabled: false,
  },
  {
    label: "Users",
    href: paths.employees.list,
    icon: Users,
    permission: "users.view",
    disabled: false,
  },
  {
    label: "Leads",
    href: paths.leads.list,
    icon: UserSquare2,
    permission: "leads.view",
    disabled: false,
  },
  {
    label: "Follow-ups",
    href: paths.followups.list,
    icon: CalendarClock,
    permission: "leads.view",
    disabled: false,
  },
  {
    label: "Projects",
    href: paths.projects.list,
    icon: Building2,
    permission: "projects.view",
    disabled: false,
  },
  {
    label: "Visits",
    href: paths.visits.list,
    icon: MapPinned,
    permission: "visits.view",
    disabled: false,
  },
  {
    label: "Bookings",
    href: paths.bookings.list,
    icon: CreditCard,
    permission: "bookings.view",
    disabled: false,
  },
  {
    label: "Payments",
    href: paths.payments.dashboard,
    icon: Banknote,
    permission: "payments.view",
    disabled: false,
  },
  {
    label: "Calls",
    href: "#",
    icon: PhoneCall,
    permission: null,
    disabled: true,
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isSuperAdmin = user?.role.code === "PLATFORM_SUPER_ADMIN";

  const visibleNavigation = navigation.filter((item) => {
    if (item.disabled) {
      return false;
    }

    if (item.label === "Companies") {
      return isSuperAdmin && hasPermission("companies.view");
    }

    if (item.permission) {
      return hasPermission(item.permission);
    }

    return true;
  });

  const disabledNavigation = navigation.filter((item) => item.disabled);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-sidebar-foreground/70">
            CRM SaaS
          </p>
          <p className="font-semibold">{env.VITE_APP_NAME}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === paths.dashboard}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {disabledNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/40"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              <span className="ml-auto text-xs">Soon</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
