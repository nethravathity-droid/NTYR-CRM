import { useAuth } from "@/features/auth/hooks/useAuth";
import { AdminChartsSection } from "@/features/dashboards/components/AdminChartsSection";
import { AdminKpiSection } from "@/features/dashboards/components/AdminKpiSection";
import { AdminQuickActions, buildAdminQuickActions } from "@/features/dashboards/components/AdminQuickActions";
import { AdminTablesSection } from "@/features/dashboards/components/AdminTablesSection";
import { DashboardRightPanel } from "@/features/dashboards/components/DashboardRightPanel";
import { SalesPipelineKanban } from "@/features/dashboards/components/SalesPipelineKanban";
import { useAdminDashboard } from "@/features/dashboards/hooks/useAdminDashboard";
import { GlassCard } from "@/components/premium/PremiumCards";
import { DashboardDateRangePicker } from "@/components/premium/DashboardDateRangePicker";
import { useDashboardDate } from "@/context/DashboardDateContext";

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CompanyAdminDashboardPage() {
  const { user } = useAuth();
  const { range } = useDashboardDate();
  const data = useAdminDashboard(range);
  const quickActions = buildAdminQuickActions(data.hasPermission);

  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden">
        <div className="relative bg-gradient-to-r from-[#2563EB] to-[#14B8A6] p-6 text-white md:p-8">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">{formatToday()}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
                Welcome back{user?.user.firstName ? `, ${user.user.firstName}` : ""}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                {user?.company.name ?? "Company"} executive dashboard — live CRM performance, pipeline, and collections.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <DashboardDateRangePicker variant="hero" />
              <div className="rounded-[18px] bg-white/15 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">Current Company</p>
                <p className="text-lg font-semibold">{user?.company.name}</p>
                <p className="text-xs text-white/75">{user?.company.code} · {user?.role.name}</p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 right-24 h-28 w-28 rounded-full bg-white/10" />
        </div>
      </GlassCard>

      <AdminQuickActions actions={quickActions} />

      <AdminKpiSection kpis={data.kpis} dateRange={range} loading={data.isLoading} />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {data.canReports ? (
            <AdminChartsSection
              dailyReport={data.dailyReport}
              monthlyReport={data.monthlyReport}
              employeeReport={data.employeeReport}
              dateRange={range}
            />
          ) : null}

          <SalesPipelineKanban
            leads={data.pipelineLeads}
            loading={data.loading.pipeline}
            canUpdate={data.canUpdateLeads}
          />

          <AdminTablesSection
            todayFollowups={data.todayFollowups}
            recentLeads={data.recentLeads}
            upcomingVisits={data.upcomingVisits}
            recentBookings={data.recentBookings}
            overduePayments={data.overduePayments}
            activities={data.activities}
            topEmployees={data.topEmployees}
            loading={data.loading}
          />
        </div>

        <DashboardRightPanel
          todayFollowups={data.todayFollowups}
          overdueFollowups={data.overdueFollowups}
          upcomingVisits={data.upcomingVisits}
          pendingBookings={data.pendingBookings}
          bestPerformer={data.bestPerformer}
          inventory={data.inventory}
          paymentSummary={{
            todaysCollection: data.kpis.todaysCollection,
            weeklyCollection: data.kpis.weeklyCollection,
            monthlyCollection: data.kpis.monthlyCollection,
            outstanding: data.kpis.outstanding,
            overdueAmount: data.kpis.overdueAmount,
            overdueCount: data.kpis.overdueCount,
          }}
        />
      </div>
    </div>
  );
}
