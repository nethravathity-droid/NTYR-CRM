import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useSalesReport } from "@/features/reports/hooks/useReports";
import { formatCurrency, type ReportFiltersParams } from "@/features/reports/types/report.types";

export function SalesReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = useSalesReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={TrendingUp} tone="indigo" title="Sales Report" description="Booking pipeline and sales performance." action={<ReportExportButtons reportType="sales" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading label="Loading sales report..." /> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Bookings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.totalBookings}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.approvedBookings}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data.summary.totalValue)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Average Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data.summary.averageValue)}</p></CardContent></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TrendLineChart title="Sales Trend" chart={data.trend} />
            <BreakdownBarChart title="Sales by Project" data={data.byProject} />
          </div>
          <ReportDataTable title="Booking Records" rows={data.rows.rows} />
        </>
      ) : null}
    </div>
  );
}
