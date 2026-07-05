import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/shared/Loading";
import { IconBox } from "@/features/companies/components/IconBox";
import { DeleteEmployeeDialog } from "@/features/employees/components/DeleteEmployeeDialog";
import { EmployeeStatusBadge } from "@/features/employees/components/EmployeeStatusBadge";
import { ResetPasswordDialog } from "@/features/employees/components/ResetPasswordDialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { employeeStatusOptions } from "@/features/employees/components/EmployeeStatusBadge";
import {
  useDeleteEmployee,
  useEmployee,
  useResetEmployeePassword,
  useUpdateEmployeeStatus,
} from "@/features/employees/hooks/useEmployees";
import type { UserStatus } from "@/features/employees/types/employee.types";
import { getEmployeeDisplayName } from "@/features/employees/schemas/employee.schema";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value || "—"}</p>
    </div>
  );
}

export function EmployeeDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("users.update");
  const canDelete = hasPermission("users.delete");

  const { data: employee, isLoading, error } = useEmployee(uuid);
  const updateStatus = useUpdateEmployeeStatus();
  const resetPassword = useResetEmployeePassword();
  const deleteEmployee = useDeleteEmployee();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = async (status: UserStatus) => {
    if (!uuid || !employee || employee.status === status) return;
    setActionError(null);
    try {
      await updateStatus.mutateAsync({ uuid, status });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleActiveToggle = async (isActive: boolean) => {
    if (!uuid) return;
    await handleStatusChange(isActive ? "ACTIVE" : "INACTIVE");
  };

  const handleResetPassword = async (password: string) => {
    if (!uuid) return;
    setActionError(null);
    try {
      await resetPassword.mutateAsync({ uuid, password });
      setShowResetDialog(false);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await deleteEmployee.mutateAsync(uuid);
      navigate(paths.employees.list);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading employee details..." />;
  }

  if (error || !employee) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error ? getApiErrorMessage(error) : "Employee not found"}
      </div>
    );
  }

  const displayName = getEmployeeDisplayName(employee);
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
              <Link to={paths.employees.list}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  <EmployeeStatusBadge status={employee.status} />
                </div>
                <p className="mt-1 text-violet-100">
                  {employee.employeeCode} · @{employee.username}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <>
                <Button variant="secondary" className="bg-white text-violet-700" asChild>
                  <Link to={paths.employees.edit(employee.uuid)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  className="bg-amber-400 text-amber-950 hover:bg-amber-300"
                  onClick={() => setShowResetDialog(true)}
                >
                  <KeyRound className="h-4 w-4" />
                  Reset Password
                </Button>
              </>
            ) : null}
            {canDelete ? (
              <Button
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-border/60 lg:col-span-2">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={UserRound} tone="indigo" />
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Personal and account information.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <DetailItem label="First Name" value={employee.firstName} />
            <DetailItem label="Last Name" value={employee.lastName} />
            <DetailItem label="Display Name" value={employee.displayName} />
            <DetailItem label="Username" value={employee.username} />
            <DetailItem label="Mobile" value={employee.mobile} />
            <DetailItem label="Email" value={employee.officialEmail} />
            <DetailItem
              label="Last Login"
              value={
                employee.lastLoginAt
                  ? new Date(employee.lastLoginAt).toLocaleString()
                  : "Never"
              }
            />
            <DetailItem
              label="Password Changed"
              value={
                employee.passwordChangedAt
                  ? new Date(employee.passwordChangedAt).toLocaleString()
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={Briefcase} tone="amber" />
              <div>
                <CardTitle>Status & Access</CardTitle>
                <CardDescription>Manage account state.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {canUpdate ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employee-status">Account Status</Label>
                  <Select
                    id="employee-status"
                    value={employee.status}
                    disabled={updateStatus.isPending}
                    onChange={(event) =>
                      void handleStatusChange(event.target.value as UserStatus)
                    }
                  >
                    {employeeStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="employee-active">Active Access</Label>
                    <p className="text-xs text-muted-foreground">
                      Toggle between active and inactive
                    </p>
                  </div>
                  <Switch
                    id="employee-active"
                    checked={employee.status === "ACTIVE"}
                    disabled={updateStatus.isPending}
                    onCheckedChange={(checked) => void handleActiveToggle(checked)}
                  />
                </div>
              </>
            ) : (
              <EmployeeStatusBadge status={employee.status} />
            )}

            <div className="flex gap-2">
              <Badge variant="outline">
                Email {employee.emailVerified ? "verified" : "unverified"}
              </Badge>
              <Badge variant="outline">
                Mobile {employee.mobileVerified ? "verified" : "unverified"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={Building2} tone="emerald" />
              <CardTitle>Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <DetailItem label="Branch" value={employee.branch.name} />
            <DetailItem label="Department" value={employee.department.name} />
            <DetailItem label="Designation" value={employee.designation.name} />
            <DetailItem label="Role" value={employee.role.name} />
            <DetailItem
              label="Manager"
              value={
                employee.manager
                  ? employee.manager.displayName || employee.manager.employeeCode
                  : null
              }
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={Phone} tone="cyan" />
              <CardTitle>Contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.officialEmail || "—"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.mobile}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteEmployeeDialog
        employee={{
          ...employee,
          role: { id: employee.role.id, code: employee.role.code, name: employee.role.name },
          branch: { id: employee.branch.id, name: employee.branch.name },
          department: { id: employee.department.id, name: employee.department.name },
          designation: { id: employee.designation.id, name: employee.designation.name },
          manager: employee.manager
            ? {
                id: employee.manager.id,
                uuid: employee.manager.uuid,
                displayName: employee.manager.displayName,
              }
            : null,
        }}
        open={showDeleteDialog}
        isDeleting={deleteEmployee.isPending}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => void handleDelete()}
      />

      <ResetPasswordDialog
        employeeName={displayName}
        employeeCode={employee.employeeCode}
        open={showResetDialog}
        isSubmitting={resetPassword.isPending}
        onOpenChange={setShowResetDialog}
        onSubmit={(password) => void handleResetPassword(password)}
      />
    </div>
  );
}
