import { Building2, TrendingUp, Users } from "lucide-react";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { TrendLineChart } from "@/features/reports/components/ReportCharts";
import { useDashboardChart, useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { Loading } from "@/components/shared/Loading";
import type { DashboardChartMetric } from "@/features/dashboard/types/dashboard.types";

const CHART_METRICS: Array<{ metric: DashboardChartMetric; title: string }> = [
  { metric: "employees", title: "User Growth" },
  { metric: "leads", title: "Lead Activity" },
  { metric: "bookings", title: "Booking Trend" },
  { metric: "revenue", title: "Revenue Trend" },
];

function PlatformChart({ metric, title }: { metric: DashboardChartMetric; title: string }) {
  const { data: chart, isLoading } = useDashboardChart(metric, "30d");
  if (isLoading) return <Loading label={`Loading ${title.toLowerCase()}...`} />;
  if (!chart) return null;
  return (
    <GlassCard className="p-5">
      <SectionHeader title={title} description="Last 30 days" />
      <TrendLineChart title="" chart={{ labels: chart.labels, datasets: chart.datasets }} />
    </GlassCard>
  );
}

export function PlatformAnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: companiesData } = useCompanies({ page: 1, limit: 100 });

  const companies = companiesData?.companies ?? [];
  const active = companies.filter((c) => c.status === "ACTIVE").length;

  if (summaryLoading) return <Loading label="Loading platform analytics..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Growth metrics and operational trends across all tenants.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Companies" value={summary?.totalCompanies ?? companiesData?.pagination.total ?? 0} icon={Building2} tone="indigo" />
        <KpiCard label="Active Companies" value={active} icon={TrendingUp} tone="emerald" />
        <KpiCard label="Platform Users" value={summary?.totalEmployees ?? 0} icon={Users} tone="cyan" />
        <KpiCard label="Total Leads" value={summary?.totalLeads ?? 0} icon={TrendingUp} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {CHART_METRICS.map((item) => (
          <PlatformChart key={item.metric} metric={item.metric} title={item.title} />
        ))}
      </div>
    </div>
  );
}
