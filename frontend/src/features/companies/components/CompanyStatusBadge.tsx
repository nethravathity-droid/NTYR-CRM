import { Badge } from "@/components/ui/badge";
import type { CompanyStatus } from "@/features/companies/types/company.types";

const statusConfig: Record<
  CompanyStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  TRIAL: {
    label: "Trial",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
  },
  EXPIRED: {
    label: "Expired",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
  },
};

interface CompanyStatusBadgeProps {
  status: CompanyStatus;
}

export function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export const companyStatusOptions: Array<{ value: CompanyStatus; label: string }> =
  [
    { value: "TRIAL", label: "Trial" },
    { value: "ACTIVE", label: "Active" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "EXPIRED", label: "Expired" },
  ];
