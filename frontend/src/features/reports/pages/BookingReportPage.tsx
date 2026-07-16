import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useBookingReport } from "@/features/reports/hooks/useReports";
import { formatCurrency, type ReportFiltersParams } from "@/features/reports/types/report.types";

export function BookingReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = useBookingReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={CreditCard} tone="amber" title="Booking Report" description="Booking approvals, pipeline, and value trends." action={<ReportExportButtons reportType="bookings" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading label="Loading booking report..." /> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.total}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.approved}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending Approval</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.pendingApproval}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data.summary.totalValue)}</p></CardContent></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownBarChart title="Bookings by Status" data={data.byStatus} />
            <TrendLineChart title="Booking Trend" chart={data.trend} />
          </div>
          <ReportDataTable title="Booking Records" rows={data.rows.rows} />
        </>
      ) : null}
    </div>
  );
}
