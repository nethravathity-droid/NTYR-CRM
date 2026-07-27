import { Link } from "react-router-dom";
import { Plus, UserRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { IconBox } from "@/features/companies/components/IconBox";
import { EmployeeStatusBadge } from "@/features/employees/components/EmployeeStatusBadge";
import { getEmployeeDisplayName } from "@/features/employees/schemas/employee.schema";
import type { EmployeeListItem } from "@/features/employees/types/employee.types";
import { paths } from "@/routes/paths";

interface AdminEmployeesSectionProps {
  employees: EmployeeListItem[];
  total: number;
  loading?: boolean;
  canCreate: boolean;
  companyCode?: string;
}

export function AdminEmployeesSection({
  employees,
  total,
  loading = false,
  canCreate,
  companyCode,
}: AdminEmployeesSectionProps) {
  return (
    <Card className="app-panel overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconBox icon={Users} tone="violet" />
            <div>
              <CardTitle>Team & employee logins</CardTitle>
              <CardDescription>
                Create separate username and password for each employee. They all use company code{" "}
                <span className="font-mono font-semibold">{companyCode ?? "—"}</span> at login.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={paths.employees.list}>Manage all</Link>
            </Button>
            {canCreate ? (
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700" asChild>
                <Link to={paths.employees.create}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Employee
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">{total} employees</Badge>
          <Badge variant="outline">
            {employees.filter((employee) => employee.status === "ACTIVE").length} active
          </Badge>
        </div>

        {loading ? <Loading label="Loading team..." /> : null}

        {!loading && employees.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <UserRound className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <p className="mt-3 font-medium">No employees yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add telecallers, sales executives, and managers — each gets their own login.
            </p>
            {canCreate ? (
              <Button className="mt-4 bg-violet-600 hover:bg-violet-700" asChild>
                <Link to={paths.employees.create}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create first employee
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {!loading && employees.length > 0 ? (
          <div className="divide-y rounded-xl border">
            {employees.slice(0, 5).map((employee) => (
              <Link
                key={employee.uuid}
                to={paths.employees.details(employee.uuid)}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium">{getEmployeeDisplayName(employee)}</p>
                  <p className="text-xs text-muted-foreground">
                    @{employee.username} · {employee.employeeCode} · {employee.role.name}
                  </p>
                </div>
                <EmployeeStatusBadge status={employee.status} />
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
