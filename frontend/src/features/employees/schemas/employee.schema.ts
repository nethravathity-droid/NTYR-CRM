import { z } from "zod";

const optionalString = z.string().trim().optional().or(z.literal(""));

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const employeeFormSchema = z.object({
  branchId: z.coerce.number().int().positive("Branch is required"),
  departmentId: z.coerce.number().int().positive("Department is required"),
  designationId: z.coerce.number().int().positive("Designation is required"),
  roleId: z.coerce.number().int().positive("Role is required"),
  managerUserId: z.number().int().positive().nullable().optional(),
  employeeCode: z.string().trim().min(1, "Employee code is required").max(20),
  username: z.string().trim().min(3, "Username is required").max(100),
  password: passwordSchema.optional(),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: optionalString,
  displayName: optionalString,
  officialEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Invalid email",
    ),
  mobile: z.string().trim().min(10, "Mobile is required").max(20),
  profilePhotoUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https?:\/\/.+/.test(value),
      "Enter a valid profile photo URL",
    ),
});

export const employeeCreateSchema = employeeFormSchema.extend({
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>;
export type EmployeeCreateSchema = z.infer<typeof employeeCreateSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const employeeDefaultValues: EmployeeFormSchema = {
  branchId: 0,
  departmentId: 0,
  designationId: 0,
  roleId: 0,
  managerUserId: null,
  employeeCode: "",
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  displayName: "",
  officialEmail: "",
  mobile: "",
  profilePhotoUrl: "",
};

export function mapEmployeeToFormValues(
  employee: import("../types/employee.types").EmployeeDetail,
): EmployeeFormSchema {
  return {
    branchId: employee.branch.id,
    departmentId: employee.department.id,
    designationId: employee.designation.id,
    roleId: employee.role.id,
    managerUserId: employee.manager?.id ?? null,
    employeeCode: employee.employeeCode,
    username: employee.username,
    firstName: employee.firstName,
    lastName: employee.lastName ?? "",
    displayName: employee.displayName ?? "",
    officialEmail: employee.officialEmail ?? "",
    mobile: employee.mobile,
    profilePhotoUrl: employee.profilePhotoUrl ?? "",
  };
}

export function normalizeEmployeePayload(values: EmployeeFormSchema) {
  const emptyToNull = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };

  return {
    branchId: values.branchId,
    departmentId: values.departmentId,
    designationId: values.designationId,
    roleId: values.roleId,
    managerUserId: values.managerUserId ?? null,
    employeeCode: values.employeeCode.trim(),
    username: values.username.trim(),
    ...(values.password ? { password: values.password } : {}),
    firstName: values.firstName.trim(),
    lastName: emptyToNull(values.lastName),
    displayName: emptyToNull(values.displayName),
    officialEmail: emptyToNull(values.officialEmail),
    mobile: values.mobile.trim(),
    profilePhotoUrl: emptyToNull(values.profilePhotoUrl),
  };
}

export function getEmployeeDisplayName(employee: {
  displayName: string | null;
  firstName: string;
  lastName: string | null;
}): string {
  return (
    employee.displayName?.trim() ||
    `${employee.firstName} ${employee.lastName ?? ""}`.trim()
  );
}
