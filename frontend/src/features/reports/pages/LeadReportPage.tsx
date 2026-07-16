import { useState } from "react";
import { UserSquare2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, BreakdownPieChart, ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useLeadReport } from "@/features/reports/hooks/useReports";
import type { ReportFiltersParams } from "@/features/reports/types/report.types";

export function LeadReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = useLeadReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={UserSquare2} tone="indigo" title="Lead Report" description="Lead funnel, sources, and conversion analytics." action={<ReportExportButtons reportType="leads" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading label="Loading lead report..." /> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["Total", data.summary.total],
              ["Active", data.summary.active],
              ["Converted", data.summary.converted],
              ["Lost", data.summary.lost],
              ["Conversion %", data.summary.conversionRate],
            ].map(([label, value]) => (
              <Card key={label as string}><CardHeader className="pb-2"><CardTitle className="text-sm">{label as string}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownPieChart title="Lead Source" data={data.leadSourceChart} />
            <BreakdownBarChart title="Lead Status Funnel" data={data.leadStatusFunnel} />
            <TrendLineChart title="Lead Trend" chart={data.trend} />
          </div>
          <ReportDataTable title="Lead Records" rows={data.rows.rows} />
        </>
      ) : null}
    </div>
  );
}
