import { Link } from "react-router-dom";
import {
  BreakdownBarChart,
  BreakdownPieChart,
  TrendLineChart,
} from "@/features/reports/components/ReportCharts";
import type { DashboardReport, EmployeeReport } from "@/features/reports/types/report.types";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { paths } from "@/routes/paths";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AdminChartsSectionProps {
  dailyReport?: DashboardReport;
  monthlyReport?: DashboardReport;
  employeeReport?: EmployeeReport;
}

function EmployeePerformanceChart({ data }: { data: EmployeeReport["performance"] }) {
  const chartData = data.slice(0, 8).map((e) => ({
    name: (e.displayName ?? e.employeeCode).slice(0, 12),
    bookings: e.bookingsClosed,
    leads: e.leadsAssigned,
  }));

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Employee Performance" description="Bookings closed this month" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="bookings" fill="#2563EB" radius={[6, 6, 0, 0]} name="Bookings" />
            <Bar dataKey="leads" fill="#14B8A6" radius={[6, 6, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function AdminChartsSection({ dailyReport, monthlyReport, employeeReport }: AdminChartsSectionProps) {
  const report = monthlyReport ?? dailyReport;
  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">Revenue, pipeline, and team performance insights</p>
        </div>
        <Link to={paths.reports.dashboard} className="text-sm font-medium text-[#2563EB] hover:underline">
          Full analytics →
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="enterprise-chart">
          <TrendLineChart title="Revenue Trend" chart={report.revenueTrend} />
        </div>
        <div className="enterprise-chart">
          <BreakdownPieChart title="Lead Sources" data={report.leadSourceChart} />
        </div>
        <div className="enterprise-chart">
          <BreakdownBarChart title="Lead Status Funnel" data={report.leadStatusFunnel} />
        </div>
        <div className="enterprise-chart">
          <TrendLineChart title="Booking Trend" chart={report.bookingTrend} />
        </div>
        <div className="enterprise-chart">
          <TrendLineChart title="Payment Collection Trend" chart={report.paymentCollection} />
        </div>
        <div className="enterprise-chart">
          <TrendLineChart title="Sales Trend" chart={report.salesTrend} />
        </div>
      </div>

      {employeeReport && employeeReport.performance.length > 0 ? (
        <EmployeePerformanceChart data={employeeReport.performance} />
      ) : null}
    </div>
  );
}
