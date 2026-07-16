import { useState } from "react";
import { MapPinned } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useVisitReport } from "@/features/reports/hooks/useReports";
import type { ReportFiltersParams } from "@/features/reports/types/report.types";

export function VisitReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = useVisitReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={MapPinned} tone="cyan" title="Visit Report" description="Site visit scheduling and completion analytics." action={<ReportExportButtons reportType="visits" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading label="Loading visit report..." /> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(data.summary).map(([key, value]) => (
              <Card key={key}><CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownBarChart title="Visits by Status" data={data.byStatus} />
            <TrendLineChart title="Visit Trend" chart={data.trend} />
          </div>
          <ReportDataTable title="Visit Records" rows={data.rows.rows} />
        </>
      ) : null}
    </div>
  );
}
