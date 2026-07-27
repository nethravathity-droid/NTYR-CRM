import { useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Loader2,
  Lock,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBox, type IconBoxTone } from "@/features/companies/components/IconBox";
import {
  ASSIGNABLE_EMPLOYEE_ROLE_CODES,
  employeeCreateSchema,
  employeeDefaultValues,
  employeeFormSchema,
  resolveDefaultBranchId,
  resolveDefaultDepartmentId,
  resolveDefaultDesignationId,
  type EmployeeFormSchema,
} from "@/features/employees/schemas/employee.schema";
import { useEmployeeFormOptions } from "@/features/employees/hooks/useEmployees";
import { cn } from "@/lib/utils";

function sameId(left: number | string | null | undefined, right: number | string | null | undefined) {
  if (left == null || right == null || left === "" || right === "") {
    return false;
  }
  return Number(left) === Number(right);
}

interface EmployeeFormProps {
  mode: "create" | "edit";
  defaultValues?: EmployeeFormSchema;
  excludeUserId?: number;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: EmployeeFormSchema) => Promise<void> | void;
  onCancel?: () => void;
}

export function EmployeeForm({
  mode,
  defaultValues = employeeDefaultValues,
  excludeUserId,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<EmployeeFormSchema>({
    resolver: zodResolver(
      mode === "create" ? employeeCreateSchema : employeeFormSchema,
    ) as Resolver<EmployeeFormSchema>,
    defaultValues,
  });

  const branchId = watch("branchId");
  const departmentId = watch("departmentId");
  const roleId = watch("roleId");
  const designationId = watch("designationId");
  const hasValidationErrors = Object.keys(errors).length > 0;

  const { data: options, isLoading: isLoadingOptions } = useEmployeeFormOptions({
    branchId: mode === "edit" ? branchId || undefined : undefined,
    excludeUserId,
  });

  useEffect(() => {
    if (!branchId || !options || !departmentId) {
      return;
    }

    const departmentStillValid = options.departments.some(
      (department) =>
        sameId(department.id, departmentId) && sameId(department.branchId, branchId),
    );

    if (!departmentStillValid) {
      setValue("departmentId", 0);
    }
  }, [branchId, departmentId, options, setValue]);

  const departments =
    options?.departments.filter(
      (department) => !branchId || sameId(department.branchId, branchId),
    ) ?? [];

  const selectedRole = options?.roles.find((role) => sameId(role.id, roleId));
  const assignableRoles =
    options?.roles.filter((role) => ASSIGNABLE_EMPLOYEE_ROLE_CODES.has(role.code)) ?? [];
  const singleBranch = options?.branches.length === 1 ? options.branches[0] : null;

  useEffect(() => {
    if (!options || mode !== "create") {
      return;
    }

    if (options.branches.length === 1 && !branchId) {
      setValue("branchId", options.branches[0]!.id);
    }
  }, [options, branchId, mode, setValue]);

  useEffect(() => {
    if (!options || !selectedRole || mode !== "create") {
      return;
    }

    const roleCode = selectedRole.code;
    const departmentByCode: Record<string, string[]> = {
      TELECALLER: ["telecalling", "tel"],
      SALES_EXECUTIVE: ["sales"],
      MANAGER: ["sales", "administration", "admin"],
      COMPANY_ADMIN: ["administration", "admin"],
    };

    const designationByCode: Record<string, string[]> = {
      TELECALLER: ["telecaller", "tc"],
      SALES_EXECUTIVE: ["sales executive", "se"],
      MANAGER: ["sales manager", "mgr"],
      COMPANY_ADMIN: ["company administrator", "ca"],
    };

    const departmentHints = departmentByCode[roleCode] ?? [];
    const matchedDepartment = departments.find((department) =>
      departmentHints.some((hint) => department.name.toLowerCase().includes(hint)),
    );

    if (matchedDepartment && !sameId(departmentId, matchedDepartment.id)) {
      setValue("departmentId", matchedDepartment.id);
    } else if (departments.length === 1 && !departmentId) {
      setValue("departmentId", departments[0]!.id);
    }

    const designationHints = designationByCode[roleCode] ?? [];
    const matchedDesignation = options.designations.find((designation) =>
      designationHints.some((hint) => designation.name.toLowerCase().includes(hint)),
    );

    if (matchedDesignation && !sameId(designationId, matchedDesignation.id)) {
      setValue("designationId", matchedDesignation.id);
    }
  }, [
    options,
    selectedRole,
    departments,
    departmentId,
    designationId,
    mode,
    setValue,
  ]);

  const submitCreate = async (values: EmployeeFormSchema) => {
    if (!options) {
      setError("root", { message: "Organization options are still loading. Please wait." });
      return;
    }

    const roleForSubmit = options.roles.find((role) => sameId(role.id, values.roleId));

    if (!roleForSubmit) {
      setError("roleId", { message: "Select a role for this employee." });
      return;
    }

    const resolvedBranchId =
      values.branchId > 0 ? values.branchId : resolveDefaultBranchId(options.branches);

    if (!resolvedBranchId) {
      setError("root", {
        message: "No branch is set up for this company. Complete company login setup first.",
      });
      return;
    }

    const resolvedDepartmentId = resolveDefaultDepartmentId(
      options.departments,
      resolvedBranchId,
      roleForSubmit.code,
    );

    const resolvedDesignationId = resolveDefaultDesignationId(
      options.designations,
      roleForSubmit.code,
    );

    if (!resolvedDepartmentId || !resolvedDesignationId) {
      setError("root", {
        message: "Organization setup is incomplete. Refresh the page or contact support.",
      });
      return;
    }

    const displayName =
      values.displayName?.trim() ||
      `${values.firstName.trim()} ${values.lastName?.trim() ?? ""}`.trim();

    await onSubmit({
      ...values,
      branchId: resolvedBranchId,
      departmentId: resolvedDepartmentId,
      designationId: resolvedDesignationId,
      managerUserId: null,
      displayName,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(
        mode === "create" ? submitCreate : onSubmit,
        () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      )}
      className="space-y-6"
    >
      {errors.root?.message ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {errors.root.message}
        </div>
      ) : null}

      {hasValidationErrors ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Please fix the highlighted fields below before saving.
        </div>
      ) : null}

      {isLoadingOptions ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading organization options...
        </div>
      ) : null}

      {mode === "create" ? (
        <>
          <FormSection
            icon={Building2}
            tone="indigo"
            title="Role"
            description="Choose the workspace this employee will use after login."
            columns="grid-cols-1"
          >
            <FormField label="Employee role" error={errors.roleId?.message}>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value > 0 ? String(field.value) : ""}
                    onChange={(event) => {
                      field.onChange(event.target.value ? Number(event.target.value) : 0);
                    }}
                  >
                    <option value="">Select role</option>
                    {assignableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </FormField>

            {selectedRole ? (
              <p className="text-sm text-muted-foreground">
                Selected role:{" "}
                <span className="font-medium text-foreground">{selectedRole.name}</span>
              </p>
            ) : null}

            {singleBranch ? (
              <p className="text-sm text-muted-foreground">
                Office: <span className="font-medium text-foreground">{singleBranch.name}</span>
              </p>
            ) : (
              <FormField label="Branch" error={errors.branchId?.message}>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value > 0 ? String(field.value) : ""}
                      onChange={(event) => {
                        field.onChange(event.target.value ? Number(event.target.value) : 0);
                      }}
                    >
                      <option value="">Select branch</option>
                      {options?.branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormField>
            )}

            {!isLoadingOptions && options?.branches.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                No branch is set up for this company yet. Complete company login setup first, then
                return here to add employees.
              </div>
            ) : null}
          </FormSection>
        </>
      ) : (
        <FormSection
          icon={Building2}
          tone="indigo"
          title="Organization"
          description="Assign branch, department, role, designation, and manager."
        >
          <FormField label="Role" error={errors.roleId?.message} className="md:col-span-2">
            <Select {...register("roleId", { valueAsNumber: true })}>
              <option value={0}>Select role</option>
              {options?.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Branch" error={errors.branchId?.message}>
            <Select {...register("branchId", { valueAsNumber: true })}>
              <option value={0}>Select branch</option>
              {options?.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Department" error={errors.departmentId?.message}>
            <Select {...register("departmentId", { valueAsNumber: true })}>
              <option value={0}>Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Designation" error={errors.designationId?.message}>
            <Select {...register("designationId", { valueAsNumber: true })}>
              <option value={0}>Select designation</option>
              {options?.designations.map((designation) => (
                <option key={designation.id} value={designation.id}>
                  {designation.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Manager" error={errors.managerUserId?.message}>
            <Select
              {...register("managerUserId", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
              })}
            >
              <option value="">No manager</option>
              {options?.managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.displayName ||
                    `${manager.firstName} ${manager.lastName ?? ""}`.trim()}{" "}
                  ({manager.employeeCode})
                </option>
              ))}
            </Select>
          </FormField>
        </FormSection>
      )}

      <FormSection
        icon={UserRound}
        tone="emerald"
        title="Login credentials"
        description="Each employee gets a unique username and password for sign-in."
      >
        <FormField label="Employee Code (login ID option)" error={errors.employeeCode?.message}>
          <Input {...register("employeeCode")} placeholder="EMP001" />
        </FormField>

        <FormField label="Username (login ID)" error={errors.username?.message}>
          <Input {...register("username")} placeholder="john.doe" autoComplete="off" />
        </FormField>

        {mode === "create" ? (
          <FormField label="Password" error={errors.password?.message}>
            <Input {...register("password")} type="password" autoComplete="new-password" />
          </FormField>
        ) : null}
      </FormSection>

      <FormSection
        icon={UserRound}
        tone="indigo"
        title="Employee profile"
        description="Personal and contact details."
      >
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input {...register("firstName")} placeholder="John" />
        </FormField>

        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input {...register("lastName")} placeholder="Doe" />
        </FormField>

        {mode === "edit" ? (
          <FormField label="Display Name" error={errors.displayName?.message}>
            <Input {...register("displayName")} placeholder="John Doe" />
          </FormField>
        ) : null}

        <FormField label="Official Email" error={errors.officialEmail?.message}>
          <Input {...register("officialEmail")} type="email" placeholder="Optional" />
        </FormField>

        <FormField label="Mobile" error={errors.mobile?.message}>
          <Input {...register("mobile")} placeholder="9876543210" />
        </FormField>
      </FormSection>

      {mode === "edit" ? (
        <FormSection
          icon={Briefcase}
          tone="violet"
          title="Additional"
          description="Optional profile information."
          columns="grid-cols-1"
        >
          <FormField label="Profile Photo URL" error={errors.profilePhotoUrl?.message}>
            <Input {...register("profilePhotoUrl")} placeholder="https://..." />
          </FormField>
        </FormSection>
      ) : null}

      {mode === "create" ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          Password must include uppercase, lowercase, number, and special character.
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingOptions}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  tone,
  title,
  description,
  columns = "grid-cols-1 md:grid-cols-2",
  children,
}: {
  icon: LucideIcon;
  tone: IconBoxTone;
  title: string;
  description: string;
  columns?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-start gap-3">
          <IconBox icon={icon} tone={tone} />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-4 pt-6", columns)}>{children}</CardContent>
    </Card>
  );
}

function FormField({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
