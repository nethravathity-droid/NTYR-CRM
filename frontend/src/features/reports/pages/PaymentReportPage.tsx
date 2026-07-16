import { useState } from "react";
import { Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, BreakdownPieChart, ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { usePaymentReport } from "@/features/reports/hooks/useReports";
import { formatCurrency, type ReportFiltersParams } from "@/features/reports/types/report.types";

export function PaymentReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = usePaymentReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Banknote} tone="emerald" title="Payment Report" description="Collections, outstanding dues, and payment mode breakdown." action={<ReportExportButtons reportType="payments" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading label="Loading payment report..." /> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Collected</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data.summary.totalCollected)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Outstanding</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data.summary.totalOutstanding)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Overdue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data.summary.totalOverdue)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Paid Count</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.paidCount}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending Count</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.pendingCount}</p></CardContent></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownBarChart title="Payments by Type" data={data.byType} />
            <BreakdownPieChart title="Payments by Mode" data={data.byMode} />
            <TrendLineChart title="Collection Trend" chart={data.trend} />
          </div>
          <ReportDataTable title="Payment Records" rows={data.rows.rows} />
        </>
      ) : null}
    </div>
  );
}
