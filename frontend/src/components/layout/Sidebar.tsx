import { NavLink } from "react-router-dom";
import {
  Building2,
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
import { paths } from "@/routes/paths";

const navigation = [
  { label: "Dashboard", href: paths.dashboard, icon: LayoutDashboard, enabled: true },
  { label: "Users", href: "#", icon: Users, enabled: false },
  { label: "Leads", href: "#", icon: UserSquare2, enabled: false },
  { label: "Follow-ups", href: "#", icon: CalendarClock, enabled: false },
  { label: "Projects", href: "#", icon: Building2, enabled: false },
  { label: "Visits", href: "#", icon: MapPinned, enabled: false },
  { label: "Bookings", href: "#", icon: CreditCard, enabled: false },
  { label: "Calls", href: "#", icon: PhoneCall, enabled: false },
] as const;

export function Sidebar() {
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
        {navigation.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
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
          }

          return (
            <NavLink
              key={item.label}
              to={item.href}
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
      </nav>
    </aside>
  );
}
