import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarClock,
  CreditCard,
  MapPinned,
  PhoneCall,
  Plus,
  Target,
  UserPlus,
  Users,
  UserSquare2,
} from "lucide-react";
import { ActivityTimeline } from "@/components/premium/ActivityTimeline";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { QuickActionBar } from "@/components/premium/QuickActionBar";
import {
  BreakdownBarChart,
  BreakdownPieChart,
  TrendLineChart,
} from "@/features/reports/components/ReportCharts";
import { useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { useCallSummary } from "@/features/calls/hooks/useCalls";
import { useTodayFollowups } from "@/features/followups/hooks/useFollowups";
import { useCollectionSummary } from "@/features/payments/hooks/usePayments";
import { useDashboardReport } from "@/features/reports/hooks/useReports";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { Loading } from "@/components/shared/Loading";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

const today = new Date().toISOString().slice(0, 10);

export function CompanyAdminDashboardPage() {
  const { hasPermission } = usePermissions();
  const canReports = hasPermission("reports.view");
  const canCalls = hasPermission("calls.view");

  const { data: report, isLoading } = useDashboardReport(
    canReports ? { period: "daily", fromDate: today, toDate: today, page: 1, limit: 5 } : { period: "monthly", page: 1, limit: 5 },
  );
  const { data: monthlyReport } = useDashboardReport(
    canReports ? { period: "monthly", page: 1, limit: 5 } : { period: "monthly", page: 1, limit: 5 },
    { enabled: canReports },
  );
  const { data: callSummary } = useCallSummary({}, { enabled: canCalls });
  const { data: todayFollowups = [] } = useTodayFollowups({ enabled: hasPermission("leads.view") });
  const { data: payments } = useCollectionSummary();
  const { data: activities = [] } = useRecentActivities(10);

  const kpis = report?.kpis ?? monthlyReport?.kpis;

  if (isLoading && canReports) return <Loading label="Loading executive dashboard..." />;

  const quickActions = [
    hasPermission("leads.create") ? { label: "Add Lead", href: paths.leads.create, icon: UserPlus } : null,
    hasPermission("leads.update") ? { label: "Assign Lead", href: paths.leads.assign, icon: Users } : null,
    hasPermission("visits.create") ? { label: "Schedule Visit", href: paths.visits.create, icon: MapPinned } : null,
    hasPermission("bookings.create") ? { label: "Create Booking", href: paths.bookings.create, icon: CreditCard } : null,
    hasPermission("payments.create") ? { label: "Receive Payment", href: paths.payments.create, icon: Banknote } : null,
    hasPermission("users.create") ? { label: "Add Employee", href: paths.employees.create, icon: Plus } : null,
  ].filter(Boolean) as Array<{ label: string; href: string; icon: typeof Plus }>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground">Company-wide performance, pipeline health, and team activity.</p>
      </div>

      <QuickActionBar actions={quickActions} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Today's Leads" value={kpis?.totalLeads ?? 0} icon={UserSquare2} tone="indigo" />
        <KpiCard label="Today's Calls" value={callSummary?.totalCalls ?? 0} icon={PhoneCall} tone="violet" />
        <KpiCard label="Today's Follow-ups" value={todayFollowups.length} icon={CalendarClock} tone="amber" />
        <KpiCard label="Site Visits" value={kpis?.siteVisits ?? 0} icon={MapPinned} tone="cyan" />
        <KpiCard label="Bookings" value={kpis?.bookings ?? 0} icon={CreditCard} tone="emerald" />
        <KpiCard label="Collections" value={formatCurrency(kpis?.collection ?? payments?.totalCollected ?? 0)} icon={Banknote} tone="emerald" />
        <KpiCard label="Revenue" value={formatCurrency(kpis?.revenue ?? 0)} icon={Target} tone="blue" />
        <KpiCard label="Outstanding" value={formatCurrency(kpis?.outstanding ?? payments?.totalOutstanding ?? 0)} icon={Banknote} tone="rose" />
        <KpiCard label="Active Leads" value={kpis?.activeLeads ?? 0} icon={UserSquare2} tone="indigo" />
        <KpiCard label="Converted" value={kpis?.convertedLeads ?? 0} icon={Target} tone="emerald" />
      </div>

      {canReports && report ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <BreakdownPieChart title="Lead Sources" data={report.leadSourceChart} />
          <BreakdownBarChart title="Sales Funnel" data={report.leadStatusFunnel} />
          <TrendLineChart title="Sales Trend" chart={report.salesTrend} />
          <TrendLineChart title="Revenue Trend" chart={report.revenueTrend} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="p-5 xl:col-span-2">
          <SectionHeader title="Pipeline Snapshot" description="Live KPIs from reports engine" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Follow-ups Due</p><p className="text-2xl font-bold">{kpis?.followupsDue ?? 0}</p></div>
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Lost Leads</p><p className="text-2xl font-bold">{kpis?.lostLeads ?? 0}</p></div>
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Overdue Payments</p><p className="text-2xl font-bold">{formatCurrency(payments?.totalOverdue ?? 0)}</p></div>
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Paid Count</p><p className="text-2xl font-bold">{payments?.paidCount ?? 0}</p></div>
          </div>
          {canReports ? (
            <div className="mt-4">
              <Link to={paths.reports.dashboard} className="text-sm text-primary hover:underline">Open full analytics →</Link>
            </div>
          ) : null}
        </GlassCard>
        <div>
          <SectionHeader title="Recent Activities" />
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
}
