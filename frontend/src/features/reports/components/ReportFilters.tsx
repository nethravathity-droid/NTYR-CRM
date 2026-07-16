import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { REPORT_PERIOD_LABELS, type ReportFiltersParams, type ReportPeriod } from "@/features/reports/types/report.types";

interface ReportFiltersProps {
  filters: ReportFiltersParams;
  onChange: (filters: ReportFiltersParams) => void;
  showSearch?: boolean;
}

export function ReportFilters({ filters, onChange, showSearch = true }: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.period ?? "monthly"}
          onChange={(e) => onChange({ ...filters, period: e.target.value as ReportPeriod, page: 1 })}
        >
          {Object.entries(REPORT_PERIOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        {filters.period === "custom" ? (
          <>
            <Input type="date" value={filters.fromDate ?? ""} onChange={(e) => onChange({ ...filters, fromDate: e.target.value, page: 1 })} />
            <Input type="date" value={filters.toDate ?? ""} onChange={(e) => onChange({ ...filters, toDate: e.target.value, page: 1 })} />
          </>
        ) : null}
        {showSearch ? (
          <Input
            placeholder="Search..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
