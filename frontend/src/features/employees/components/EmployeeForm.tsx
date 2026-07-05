import { useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
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
  employeeCreateSchema,
  employeeDefaultValues,
  employeeFormSchema,
  type EmployeeFormSchema,
} from "@/features/employees/schemas/employee.schema";
import { useEmployeeFormOptions } from "@/features/employees/hooks/useEmployees";
import { cn } from "@/lib/utils";

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
    formState: { errors },
  } = useForm<EmployeeFormSchema>({
    resolver: zodResolver(
      mode === "create" ? employeeCreateSchema : employeeFormSchema,
    ) as Resolver<EmployeeFormSchema>,
    defaultValues,
  });

  const branchId = watch("branchId");
  const departmentId = watch("departmentId");

  const { data: options, isLoading: isLoadingOptions } = useEmployeeFormOptions({
    branchId: branchId || undefined,
    excludeUserId,
  });

  useEffect(() => {
    if (!branchId || !options || !departmentId) {
      return;
    }

    const departmentStillValid = options.departments.some(
      (department) =>
        department.id === departmentId && department.branchId === branchId,
    );

    if (!departmentStillValid) {
      setValue("departmentId", 0);
    }
  }, [branchId, departmentId, options, setValue]);

  const departments =
    options?.departments.filter(
      (department) => !branchId || department.branchId === branchId,
    ) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isLoadingOptions ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading organization options...
        </div>
      ) : null}

      <FormSection
        icon={Building2}
        tone="indigo"
        title="Organization"
        description="Assign branch, department, role, designation, and manager."
      >
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

        <FormField label="Role" error={errors.roleId?.message}>
          <Select {...register("roleId", { valueAsNumber: true })}>
            <option value={0}>Select role</option>
            {options?.roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
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

      <FormSection
        icon={UserRound}
        tone="emerald"
        title="Employee Profile"
        description="Personal details and login credentials."
      >
        <FormField label="Employee Code" error={errors.employeeCode?.message}>
          <Input {...register("employeeCode")} placeholder="EMP001" />
        </FormField>

        <FormField label="Username" error={errors.username?.message}>
          <Input {...register("username")} placeholder="john.doe" />
        </FormField>

        {mode === "create" ? (
          <FormField label="Password" error={errors.password?.message}>
            <Input {...register("password")} type="password" />
          </FormField>
        ) : null}

        <FormField label="First Name" error={errors.firstName?.message}>
          <Input {...register("firstName")} placeholder="John" />
        </FormField>

        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input {...register("lastName")} placeholder="Doe" />
        </FormField>

        <FormField label="Display Name" error={errors.displayName?.message}>
          <Input {...register("displayName")} placeholder="John Doe" />
        </FormField>

        <FormField label="Official Email" error={errors.officialEmail?.message}>
          <Input {...register("officialEmail")} type="email" />
        </FormField>

        <FormField label="Mobile" error={errors.mobile?.message}>
          <Input {...register("mobile")} placeholder="+91 9876543210" />
        </FormField>
      </FormSection>

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
