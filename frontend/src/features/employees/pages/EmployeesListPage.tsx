import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeleteEmployeeDialog } from "@/features/employees/components/DeleteEmployeeDialog";
import { EmployeeSearchBar } from "@/features/employees/components/EmployeeSearchBar";
import { EmployeeStatsRow } from "@/features/employees/components/EmployeeStatsRow";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import { ResetPasswordDialog } from "@/features/employees/components/ResetPasswordDialog";
import {
  useDeleteEmployee,
  useEmployeeFormOptions,
  useEmployees,
  useResetEmployeePassword,
  useUpdateEmployeeStatus,
} from "@/features/employees/hooks/useEmployees";
import { getEmployeeDisplayName } from "@/features/employees/schemas/employee.schema";
import type {
  EmployeeListItem,
  UserStatus,
} from "@/features/employees/types/employee.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function EmployeesListPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("users.create");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeListItem | null>(
    null,
  );
  const [employeeToReset, setEmployeeToReset] = useState<EmployeeListItem | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingUuid, setUpdatingUuid] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listParams = {
    page,
    limit: 10,
    search: search || undefined,
    branchId: branchId ? Number(branchId) : undefined,
    departmentId: departmentId ? Number(departmentId) : undefined,
    roleId: roleId ? Number(roleId) : undefined,
    status: status || undefined,
    sortBy: "created_at" as const,
    sortOrder: "desc" as const,
  };

  const { data, isLoading, isFetching, error } = useEmployees(listParams);
  const { data: statsData } = useEmployees({
    page: 1,
    limit: 100,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const { data: filterOptions } = useEmployeeFormOptions({});

  const deleteEmployee = useDeleteEmployee();
  const updateStatus = useUpdateEmployeeStatus();
  const resetPassword = useResetEmployeePassword();

  const handleToggleStatus = async (
    employee: EmployeeListItem,
    isActive: boolean,
  ) => {
    setActionError(null);
    setUpdatingUuid(employee.uuid);

    try {
      await updateStatus.mutateAsync({
        uuid: employee.uuid,
        status: isActive ? "ACTIVE" : "INACTIVE",
      });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setUpdatingUuid(null);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    setActionError(null);
    try {
      await deleteEmployee.mutateAsync(employeeToDelete.uuid);
      setEmployeeToDelete(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleResetPassword = async (password: string) => {
    if (!employeeToReset) return;
    setActionError(null);
    try {
      await resetPassword.mutateAsync({
        uuid: employeeToReset.uuid,
        password,
      });
      setEmployeeToReset(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const pagination = data?.pagination;
  const employees = data?.users ?? [];

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Users}
        tone="violet"
        title="Employees"
        description="Each employee gets their own username and password. Share company code + credentials at login."
        action={
          canCreate ? (
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link to={paths.employees.create}>
                <Plus className="h-4 w-4" />
                Add Employee
              </Link>
            </Button>
          ) : null
        }
      />

      {statsData ? (
        <EmployeeStatsRow
          employees={statsData.users}
          total={statsData.pagination.total}
        />
      ) : null}

      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            Search, filter, and manage your workforce.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmployeeSearchBar
            search={searchInput}
            branchId={branchId}
            departmentId={departmentId}
            roleId={roleId}
            status={status}
            options={filterOptions}
            onSearchChange={setSearchInput}
            onBranchChange={(value) => {
              setBranchId(value);
              setDepartmentId("");
              setPage(1);
            }}
            onDepartmentChange={(value) => {
              setDepartmentId(value);
              setPage(1);
            }}
            onRoleChange={(value) => {
              setRoleId(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            onClear={() => {
              setSearchInput("");
              setSearch("");
              setBranchId("");
              setDepartmentId("");
              setRoleId("");
              setStatus("");
              setPage(1);
            }}
          />

          {isLoading ? <Loading label="Loading employees..." /> : null}

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {getApiErrorMessage(error)}
            </div>
          ) : null}

          {actionError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {actionError}
            </div>
          ) : null}

          {!isLoading && !error ? (
            <>
              <EmployeeTable
                employees={employees}
                updatingUuid={updatingUuid}
                onDelete={setEmployeeToDelete}
                onResetPassword={setEmployeeToReset}
                onToggleStatus={(employee, isActive) =>
                  void handleToggleStatus(employee, isActive)
                }
              />

              {pagination && pagination.totalPages > 1 ? (
                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ·{" "}
                    {pagination.total} employees
                    {isFetching ? " · Updating..." : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <DeleteEmployeeDialog
        employee={employeeToDelete}
        open={Boolean(employeeToDelete)}
        isDeleting={deleteEmployee.isPending}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        onConfirm={() => void handleDelete()}
      />

      <ResetPasswordDialog
        employeeName={
          employeeToReset ? getEmployeeDisplayName(employeeToReset) : ""
        }
        employeeCode={employeeToReset?.employeeCode}
        open={Boolean(employeeToReset)}
        isSubmitting={resetPassword.isPending}
        onOpenChange={(open) => !open && setEmployeeToReset(null)}
        onSubmit={(password) => void handleResetPassword(password)}
      />
    </div>
  );
}
