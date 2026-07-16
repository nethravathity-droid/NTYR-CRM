import {
  Banknote,
  Building2,
  CalendarClock,
  CreditCard,
  MapPinned,
  Package,
  Percent,
  PhoneCall,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  UserSquare2,
} from "lucide-react";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { EnterpriseKpiCard, KpiGridSkeleton } from "@/features/dashboards/components/EnterpriseKpiCard";

interface AdminKpiSectionProps {
  kpis: {
    todaysLeads: number;
    newLeads: number;
    assignedLeads: number;
    todaysCalls: number;
    todaysFollowups: number;
    upcomingVisits: number;
    bookings: number;
    collections: number;
    revenue: number;
    outstanding: number;
    conversionRate: number;
    siteVisits: number;
    availableUnits: number;
    soldUnits: number;
    pendingPayments: number;
  };
  loading?: boolean;
}

export function AdminKpiSection({ kpis, loading }: AdminKpiSectionProps) {
  if (loading) return <KpiGridSkeleton count={15} />;

  const cards = [
    { label: "Today's Leads", value: kpis.todaysLeads, icon: UserSquare2, accent: "primary" as const },
    { label: "New Leads", value: kpis.newLeads, icon: UserPlus, accent: "secondary" as const },
    { label: "Assigned Leads", value: kpis.assignedLeads, icon: Users, accent: "purple" as const },
    { label: "Today's Calls", value: kpis.todaysCalls, icon: PhoneCall, accent: "primary" as const },
    { label: "Today's Follow-ups", value: kpis.todaysFollowups, icon: CalendarClock, accent: "warning" as const },
    { label: "Upcoming Visits", value: kpis.upcomingVisits, icon: MapPinned, accent: "secondary" as const },
    { label: "Bookings", value: kpis.bookings, icon: CreditCard, accent: "success" as const },
    { label: "Collections", value: formatCurrency(kpis.collections), icon: Banknote, accent: "success" as const },
    { label: "Revenue", value: formatCurrency(kpis.revenue), icon: TrendingUp, accent: "primary" as const },
    { label: "Outstanding", value: formatCurrency(kpis.outstanding), icon: Banknote, accent: "danger" as const },
    { label: "Lead Conversion", value: `${kpis.conversionRate}%`, icon: Percent, accent: "purple" as const },
    { label: "Site Visits", value: kpis.siteVisits, icon: MapPinned, accent: "secondary" as const },
    { label: "Available Units", value: kpis.availableUnits, icon: Package, accent: "primary" as const },
    { label: "Sold Units", value: kpis.soldUnits, icon: Building2, accent: "success" as const },
    { label: "Pending Payments", value: kpis.pendingPayments, icon: Target, accent: "warning" as const },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {cards.map((card) => (
        <EnterpriseKpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
