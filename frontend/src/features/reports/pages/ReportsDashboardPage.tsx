import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BreakdownBarChart, BreakdownPieChart, TrendLineChart } from "@/features/reports/components/ReportCharts";
import { ReportExportButtons } from "@/features/reports/components/ReportExportButtons";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { useDashboardReport } from "@/features/reports/hooks/useReports";
import { formatCurrency, type ReportFiltersParams } from "@/features/reports/types/report.types";
import { paths } from "@/routes/paths";

const KPI_CARDS = [
  { key: "totalLeads", label: "Total Leads" },
  { key: "activeLeads", label: "Active Leads" },
  { key: "convertedLeads", label: "Converted Leads" },
  { key: "lostLeads", label: "Lost Leads" },
  { key: "followupsDue", label: "Follow-ups Due" },
  { key: "siteVisits", label: "Site Visits" },
  { key: "bookings", label: "Bookings" },
  { key: "revenue", label: "Revenue", currency: true },
  { key: "collection", label: "Collection", currency: true },
  { key: "outstanding", label: "Outstanding", currency: true },
] as const;

export function ReportsDashboardPage() {
  const [filters, setFilters] = useState<ReportFiltersParams>({ period: "monthly", page: 1, limit: 10 });
  const { data, isLoading } = useDashboardReport(filters);

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={BarChart3}
        tone="indigo"
        title="Reports Dashboard"
        description="KPIs and analytics across leads, visits, bookings, and payments."
        action={<ReportExportButtons reportType="dashboard" filters={filters} />}
      />

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.leads}>Lead Report</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.sales}>Sales Report</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.employees}>Employee Report</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.followups}>Follow-up Report</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.visits}>Visit Report</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.bookings}>Booking Report</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to={paths.reports.payments}>Payment Report</Link></Button>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} showSearch={false} />
      {isLoading ? <Loading label="Loading dashboard report..." /> : null}

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {KPI_CARDS.map((card) => {
              const value = data.kpis[card.key];
              return (
                <Card key={card.key}>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{card.label}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {"currency" in card && card.currency ? formatCurrency(value) : value}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownPieChart title="Lead Source" data={data.leadSourceChart} />
            <BreakdownBarChart title="Lead Status Funnel" data={data.leadStatusFunnel} />
            <TrendLineChart title="Sales Trend" chart={data.salesTrend} />
            <TrendLineChart title="Revenue Trend" chart={data.revenueTrend} />
            <TrendLineChart title="Booking Trend" chart={data.bookingTrend} />
            <TrendLineChart title="Payment Collection" chart={data.paymentCollection} />
          </div>
        </>
      ) : null}
    </div>
  );
}
