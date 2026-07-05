import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/features/companies/components/IconBox";
import { employeeStatusOptions } from "@/features/employees/components/EmployeeStatusBadge";
import type {
  EmployeeFormOptions,
  UserStatus,
} from "@/features/employees/types/employee.types";

interface EmployeeSearchBarProps {
  search: string;
  branchId: string;
  departmentId: string;
  roleId: string;
  status: UserStatus | "";
  options?: EmployeeFormOptions;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: UserStatus | "") => void;
  onClear: () => void;
}

export function EmployeeSearchBar({
  search,
  branchId,
  departmentId,
  roleId,
  status,
  options,
  onSearchChange,
  onBranchChange,
  onDepartmentChange,
  onRoleChange,
  onStatusChange,
  onClear,
}: EmployeeSearchBarProps) {
  const hasFilters = Boolean(
    search || branchId || departmentId || roleId || status,
  );

  const departments = options?.departments.filter(
    (department) => !branchId || String(department.branchId) === branchId,
  );

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <IconBox icon={Filter} tone="cyan" size="sm" />
        Search & Filters
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, code, username, email, mobile..."
            className="border-0 bg-background pl-9 shadow-sm"
          />
        </div>

        <Select
          value={branchId}
          onChange={(event) => onBranchChange(event.target.value)}
          className="border-0 bg-background shadow-sm"
        >
          <option value="">All branches</option>
          {options?.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>

        <Select
          value={departmentId}
          onChange={(event) => onDepartmentChange(event.target.value)}
          className="border-0 bg-background shadow-sm"
        >
          <option value="">All departments</option>
          {departments?.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>

        <Select
          value={roleId}
          onChange={(event) => onRoleChange(event.target.value)}
          className="border-0 bg-background shadow-sm"
        >
          <option value="">All roles</option>
          {options?.roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as UserStatus | "")
          }
          className="border-0 bg-background shadow-sm"
        >
          <option value="">All statuses</option>
          {employeeStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {hasFilters ? (
          <Button type="button" variant="outline" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
