import { useState } from "react";
import { Users } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { ReportDataTable, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useEmployeeReport } from "@/features/reports/hooks/useReports";
import { formatCurrency, type ReportFiltersParams } from "@/features/reports/types/report.types";

export function EmployeeReportPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 20 });
  const { data, isLoading } = useEmployeeReport(filters);

  const rows = (data?.performance ?? []).map((item) => ({
    employeeCode: item.employeeCode,
    displayName: item.displayName,
    leadsAssigned: item.leadsAssigned,
    followupsCompleted: item.followupsCompleted,
    visitsCompleted: item.visitsCompleted,
    bookingsClosed: item.bookingsClosed,
    revenueCollected: formatCurrency(item.revenueCollected),
  }));

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Users} tone="indigo" title="Employee Performance Report" description="Track team productivity across leads, follow-ups, visits, and bookings." action={<ReportExportButtons reportType="employees" filters={filters} />} />
      <ReportFilters filters={filters} onChange={setFilters} showSearch={false} />
      {isLoading ? <Loading label="Loading employee report..." /> : null}
      {data ? (
        <>
          <TrendLineChart title="Employee Performance" chart={data.chart} />
          <ReportDataTable title="Performance Details" rows={rows} />
        </>
      ) : null}
    </div>
  );
}
