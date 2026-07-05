import { Badge } from "@/components/ui/badge";
import type { CompanyStatus } from "@/features/companies/types/company.types";

const statusConfig: Record<
  CompanyStatus,
  { label: string; variant: "success" | "default" | "warning" | "destructive" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  TRIAL: { label: "Trial", variant: "default" },
  SUSPENDED: { label: "Suspended", variant: "warning" },
  EXPIRED: { label: "Expired", variant: "destructive" },
};

interface CompanyStatusBadgeProps {
  status: CompanyStatus;
}

export function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const companyStatusOptions: Array<{ value: CompanyStatus; label: string }> =
  [
    { value: "TRIAL", label: "Trial" },
    { value: "ACTIVE", label: "Active" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "EXPIRED", label: "Expired" },
  ];
