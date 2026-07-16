import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Building2,
  CalendarClock,
  CreditCard,
  MapPinned,
  PhoneCall,
  UserPlus,
  Users,
} from "lucide-react";
import { paths } from "@/routes/paths";

export type AdminQuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

export function buildAdminQuickActions(hasPermission: (p: string) => boolean): AdminQuickAction[] {
  return [
    hasPermission("leads.create")
      ? { label: "Add Lead", href: paths.leads.create, icon: UserPlus, accent: "bg-[#2563EB]" }
      : null,
    hasPermission("leads.create")
      ? { label: "Add Customer", href: paths.leads.create, icon: Users, accent: "bg-[#14B8A6]" }
      : null,
    hasPermission("leads.create")
      ? { label: "Schedule Follow-up", href: paths.followups.create, icon: CalendarClock, accent: "bg-[#8B5CF6]" }
      : null,
    hasPermission("visits.create")
      ? { label: "Schedule Visit", href: paths.visits.create, icon: MapPinned, accent: "bg-[#F59E0B]" }
      : null,
    hasPermission("bookings.create")
      ? { label: "Create Booking", href: paths.bookings.create, icon: CreditCard, accent: "bg-[#10B981]" }
      : null,
    hasPermission("payments.create")
      ? { label: "Receive Payment", href: paths.payments.create, icon: Banknote, accent: "bg-[#14B8A6]" }
      : null,
    hasPermission("projects.create")
      ? { label: "Add Property", href: paths.projects.create, icon: Building2, accent: "bg-[#2563EB]" }
      : null,
    hasPermission("users.create")
      ? { label: "Add Employee", href: paths.employees.create, icon: Users, accent: "bg-[#8B5CF6]" }
      : null,
    hasPermission("calls.create")
      ? { label: "Log Call", href: paths.calls.create, icon: PhoneCall, accent: "bg-[#EF4444]" }
      : null,
  ].filter(Boolean) as AdminQuickAction[];
}

export function AdminQuickActions({ actions }: { actions: AdminQuickAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="app-panel p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className="group flex items-center gap-3 rounded-[18px] border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md dark:border-border dark:bg-card"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] text-white ${action.accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-sm">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
