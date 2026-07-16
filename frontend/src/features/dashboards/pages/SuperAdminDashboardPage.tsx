import { Link } from "react-router-dom";
import {
  Building2,
  CircleDollarSign,
  Server,
  TrendingUp,
  Users,
} from "lucide-react";
import { ActivityTimeline } from "@/components/premium/ActivityTimeline";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { TrendLineChart } from "@/features/reports/components/ReportCharts";
import { useDashboardChart, useDashboardSummary, useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { Loading } from "@/components/shared/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { paths } from "@/routes/paths";

export function SuperAdminDashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivities(12);
  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ page: 1, limit: 8 });
  const { data: employeeChart, isLoading: chartLoading } = useDashboardChart("employees", "30d");

  const companies = companiesData?.companies ?? [];
  const active = companies.filter((c) => c.status === "ACTIVE").length;
  const trial = companies.filter((c) => c.status === "TRIAL").length;
  const expired = companies.filter((c) => c.status === "EXPIRED" || c.status === "SUSPENDED").length;

  if (summaryLoading) return <Loading label="Loading platform dashboard..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Command Center</h1>
        <p className="text-muted-foreground">Monitor tenants, growth, and platform health in real time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Companies" value={summary?.totalCompanies ?? companiesData?.pagination.total ?? 0} icon={Building2} tone="indigo" />
        <KpiCard label="Active Companies" value={active} icon={TrendingUp} tone="emerald" />
        <KpiCard label="Trial Companies" value={trial} icon={CircleDollarSign} tone="amber" />
        <KpiCard label="Expired / Suspended" value={expired} icon={Server} tone="rose" />
        <KpiCard label="Active Users" value={summary?.totalEmployees ?? 0} hint="Platform employees" icon={Users} tone="cyan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          {chartLoading ? <Loading label="Loading growth chart..." /> : employeeChart ? (
            <GlassCard className="p-5">
              <SectionHeader title="User Growth" description="Employee registrations across the platform" />
              <TrendLineChart title="" chart={{ labels: employeeChart.labels, datasets: employeeChart.datasets }} />
            </GlassCard>
          ) : null}

          <GlassCard className="p-5">
            <SectionHeader
              title="Recent Companies"
              description="Latest tenant onboarding activity"
              action={<Link className="text-sm text-primary hover:underline" to={paths.companies.list}>View all</Link>}
            />
            {companiesLoading ? <Loading label="Loading companies..." /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>City</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.uuid}>
                      <TableCell>
                        <Link className="font-medium hover:underline" to={paths.companies.details(company.uuid)}>
                          {company.companyName}
                        </Link>
                      </TableCell>
                      <TableCell><Badge variant="outline">{company.status}</Badge></TableCell>
                      <TableCell>{company.city}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <SectionHeader title="Latest Activities" description="Cross-platform audit stream" />
          {activitiesLoading ? <Loading label="Loading activities..." /> : <ActivityTimeline activities={activities} />}
        </div>
      </div>
    </div>
  );
}
