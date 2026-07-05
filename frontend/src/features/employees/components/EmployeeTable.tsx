import { Eye, KeyRound, Pencil, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmployeeStatusBadge } from "@/features/employees/components/EmployeeStatusBadge";
import { IconBox } from "@/features/companies/components/IconBox";
import type { EmployeeListItem } from "@/features/employees/types/employee.types";
import { getEmployeeDisplayName } from "@/features/employees/schemas/employee.schema";
import { paths } from "@/routes/paths";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface EmployeeTableProps {
  employees: EmployeeListItem[];
  updatingUuid?: string | null;
  onDelete: (employee: EmployeeListItem) => void;
  onResetPassword: (employee: EmployeeListItem) => void;
  onToggleStatus: (employee: EmployeeListItem, isActive: boolean) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EmployeeTable({
  employees,
  updatingUuid,
  onDelete,
  onResetPassword,
  onToggleStatus,
}: EmployeeTableProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("users.update");
  const canDelete = hasPermission("users.delete");

  if (!employees.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
        <IconBox icon={UserRound} tone="indigo" size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-semibold">No employees found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting filters or add a new employee.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Branch / Dept</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const displayName = getEmployeeDisplayName(employee);
            const isUpdating = updatingUuid === employee.uuid;
            const isActive = employee.status === "ACTIVE";

            return (
              <TableRow key={employee.uuid} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                        isActive
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {getInitials(displayName)}
                    </div>
                    <div>
                      <p className="font-semibold">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.employeeCode} · @{employee.username}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{employee.role.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.designation.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{employee.branch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.department.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{employee.mobile}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.officialEmail || "—"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <EmployeeStatusBadge status={employee.status} />
                </TableCell>
                <TableCell>
                  {canUpdate ? (
                    <Switch
                      checked={isActive}
                      disabled={isUpdating}
                      onCheckedChange={(checked) =>
                        onToggleStatus(employee, checked)
                      }
                    />
                  ) : (
                    <EmployeeStatusBadge status={employee.status} />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                      asChild
                    >
                      <Link to={paths.employees.details(employee.uuid)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    {canUpdate ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950"
                          asChild
                        >
                          <Link to={paths.employees.edit(employee.uuid)}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                          onClick={() => onResetPassword(employee)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}

                    {canDelete ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        onClick={() => onDelete(employee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
