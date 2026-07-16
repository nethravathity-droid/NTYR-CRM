import { useNavigate } from "react-router-dom";
import {
  BreakdownBarChart,
  BreakdownPieChart,
  TrendLineChart,
} from "@/features/reports/components/ReportCharts";
import type { DashboardReport, EmployeeReport } from "@/features/reports/types/report.types";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { paths } from "@/routes/paths";
import { getChartSegmentTarget } from "@/lib/dashboard/navigation";
import type { DashboardDateRange } from "@/lib/dashboard/date-range";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AdminChartsSectionProps {
  dailyReport?: DashboardReport;
  monthlyReport?: DashboardReport;
  employeeReport?: EmployeeReport;
  dateRange: DashboardDateRange;
}

function EmployeePerformanceChart({
  data,
  onBarClick,
}: {
  data: EmployeeReport["performance"];
  onBarClick?: (employeeCode: string) => void;
}) {
  const chartData = data.slice(0, 8).map((e) => ({
    name: (e.displayName ?? e.employeeCode).slice(0, 12),
    employeeCode: e.employeeCode,
    bookings: e.bookingsClosed,
    leads: e.leadsAssigned,
  }));

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Employee Performance" description="Bookings closed in selected range" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="bookings"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              name="Bookings"
              cursor="pointer"
              onClick={(entry) => {
                const payload = entry?.payload as { employeeCode?: string } | undefined;
                if (payload?.employeeCode) onBarClick?.(payload.employeeCode);
              }}
            />
            <Bar
              dataKey="leads"
              fill="#14B8A6"
              radius={[6, 6, 0, 0]}
              name="Leads"
              cursor="pointer"
              onClick={(entry) => {
                const payload = entry?.payload as { employeeCode?: string } | undefined;
                if (payload?.employeeCode) onBarClick?.(payload.employeeCode);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function AdminChartsSection({
  dailyReport,
  monthlyReport,
  employeeReport,
  dateRange,
}: AdminChartsSectionProps) {
  const navigate = useNavigate();
  const report = monthlyReport ?? dailyReport;
  if (!report) return null;

  const openSegment = (chartTitle: string, label: string) => {
    navigate(getChartSegmentTarget(chartTitle, label, dateRange));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">Revenue, pipeline, and team performance insights</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(paths.reports.dashboard)}
          className="text-sm font-medium text-[#2563EB] hover:underline"
        >
          Full analytics →
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="enterprise-chart">
          <TrendLineChart
            title="Revenue Trend"
            chart={report.revenueTrend}
            onPointClick={(label) => openSegment("Revenue Trend", label)}
          />
        </div>
        <div className="enterprise-chart">
          <BreakdownPieChart
            title="Lead Sources"
            data={report.leadSourceChart}
            onSegmentClick={(item) => openSegment("Lead Sources", item.label)}
          />
        </div>
        <div className="enterprise-chart">
          <BreakdownBarChart
            title="Lead Status Funnel"
            data={report.leadStatusFunnel}
            onSegmentClick={(item) => openSegment("Lead Status Funnel", item.label)}
          />
        </div>
        <div className="enterprise-chart">
          <TrendLineChart
            title="Booking Trend"
            chart={report.bookingTrend}
            onPointClick={(label) => openSegment("Booking Trend", label)}
          />
        </div>
        <div className="enterprise-chart">
          <TrendLineChart
            title="Payment Collection Trend"
            chart={report.paymentCollection}
            onPointClick={(label) => openSegment("Payment Collection Trend", label)}
          />
        </div>
        <div className="enterprise-chart">
          <TrendLineChart
            title="Sales Trend"
            chart={report.salesTrend}
            onPointClick={(label) => openSegment("Sales Trend", label)}
          />
        </div>
      </div>

      {employeeReport && employeeReport.performance.length > 0 ? (
        <EmployeePerformanceChart
          data={employeeReport.performance}
          onBarClick={(employeeCode) =>
            navigate(`${paths.reports.employees}?search=${encodeURIComponent(employeeCode)}`)
          }
        />
      ) : null}
    </div>
  );
}
