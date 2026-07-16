import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useFollowupReport } from "@/features/reports/hooks/useReports";
import type { ReportFiltersParams } from "@/features/reports/types/report.types";

export function FollowupReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = useFollowupReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={CalendarClock} tone="violet" title="Follow-up Report" description="Follow-up completion and pending activity." action={<ReportExportButtons reportType="followups" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading label="Loading follow-up report..." /> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(data.summary).map(([key, value]) => (
              <Card key={key}><CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{key}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownBarChart title="Follow-ups by Type" data={data.byType} />
            <TrendLineChart title="Follow-up Trend" chart={data.trend} />
          </div>
          <ReportDataTable title="Follow-up Records" rows={data.rows.rows} />
        </>
      ) : null}
    </div>
  );
}
