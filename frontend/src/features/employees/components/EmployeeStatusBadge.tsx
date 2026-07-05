import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/features/employees/types/employee.types";

const statusConfig: Record<
  UserStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  INACTIVE: {
    label: "Inactive",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
  },
  LOCKED: {
    label: "Locked",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
  },
};

export function EmployeeStatusBadge({ status }: { status: UserStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export const employeeStatusOptions: Array<{ value: UserStatus; label: string }> =
  [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "LOCKED", label: "Locked" },
  ];
