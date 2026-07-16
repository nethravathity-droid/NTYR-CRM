import { Link } from "react-router-dom";
import { BarChart3, CalendarClock, CreditCard, Target, Users } from "lucide-react";
import { ActivityTimeline } from "@/components/premium/ActivityTimeline";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { BreakdownBarChart, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { useOverdueFollowups, useTodayFollowups } from "@/features/followups/hooks/useFollowups";
import { useCollectionSummary } from "@/features/payments/hooks/usePayments";
import { useDashboardReport, useEmployeeReport } from "@/features/reports/hooks/useReports";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { Loading } from "@/components/shared/Loading";
import { paths } from "@/routes/paths";

export function ManagerDashboardPage() {
  const { data: report, isLoading } = useDashboardReport({ period: "monthly", page: 1, limit: 5 });
  const { data: employeeReport } = useEmployeeReport({ period: "monthly", page: 1, limit: 10 });
  const { data: payments } = useCollectionSummary();
  const { data: todayFollowups = [] } = useTodayFollowups();
  const { data: overdueFollowups = [] } = useOverdueFollowups();
  const { data: activities = [] } = useRecentActivities(8);

  if (isLoading) return <Loading label="Loading manager dashboard..." />;

  const performance = employeeReport?.performance ?? [];
  const topPerformers = performance.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground">Team targets, pipeline distribution, and collection performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Team Leads" value={report?.kpis.totalLeads ?? 0} icon={Users} tone="indigo" />
        <KpiCard label="Follow-ups Today" value={todayFollowups.length} icon={CalendarClock} tone="amber" />
        <KpiCard label="Overdue Follow-ups" value={overdueFollowups.length} icon={CalendarClock} tone="rose" />
        <KpiCard label="Bookings" value={report?.kpis.bookings ?? 0} icon={CreditCard} tone="emerald" />
        <KpiCard label="Collections" value={formatCurrency(report?.kpis.collection ?? payments?.totalCollected ?? 0)} icon={BarChart3} tone="cyan" />
        <KpiCard label="Pipeline Value" value={formatCurrency(report?.kpis.revenue ?? 0)} icon={Target} tone="violet" />
        <KpiCard label="Active Leads" value={report?.kpis.activeLeads ?? 0} icon={Users} tone="blue" />
        <KpiCard label="Converted" value={report?.kpis.convertedLeads ?? 0} icon={Target} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="p-5 xl:col-span-2">
          <SectionHeader title="Employee Performance" description="Bookings and lead ownership this month" action={<Link to={paths.reports.employees} className="text-sm text-primary hover:underline">Full report</Link>} />
          <div className="space-y-3">
            {topPerformers.map((employee) => (
              <div key={employee.userId} className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">{employee.displayName ?? employee.employeeCode}</p>
                  <p className="text-sm text-muted-foreground">{employee.leadsAssigned} leads · {employee.followupsCompleted} follow-ups</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{employee.bookingsClosed} bookings</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(employee.revenueCollected)}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <div>
          <SectionHeader title="Recent Activities" />
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {report ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <BreakdownBarChart title="Lead Distribution" data={report.leadStatusFunnel} />
          <TrendLineChart title="Booking Trend" chart={report.bookingTrend} />
        </div>
      ) : null}
    </div>
  );
}
