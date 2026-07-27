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

export const employeeCreateSchema = employeeFormSchema
  .omit({ branchId: true, departmentId: true, designationId: true })
  .extend({
    password: passwordSchema,
    roleId: z.coerce.number().int().positive("Select a role for this employee."),
    branchId: z.coerce.number().int().nonnegative().default(0),
    departmentId: z.coerce.number().int().nonnegative().default(0),
    designationId: z.coerce.number().int().nonnegative().default(0),
  });

const DEPARTMENT_HINTS_BY_ROLE: Record<string, string[]> = {
  TELECALLER: ["telecalling", "tel"],
  SALES_EXECUTIVE: ["sales"],
  MANAGER: ["sales", "administration", "admin"],
  COMPANY_ADMIN: ["administration", "admin"],
};

const DESIGNATION_HINTS_BY_ROLE: Record<string, string[]> = {
  TELECALLER: ["telecaller", "tc"],
  SALES_EXECUTIVE: ["sales executive", "se"],
  MANAGER: ["sales manager", "mgr"],
  COMPANY_ADMIN: ["company administrator", "ca"],
};

export const ASSIGNABLE_EMPLOYEE_ROLE_CODES = new Set([
  "MANAGER",
  "TELECALLER",
  "SALES_EXECUTIVE",
]);

export function resolveDefaultDesignationId(
  designations: Array<{ id: number; name: string }>,
  roleCode?: string,
): number | null {
  if (!designations.length) {
    return null;
  }

  if (roleCode) {
    const hints = DESIGNATION_HINTS_BY_ROLE[roleCode] ?? [];
    const matched = designations.find((designation) =>
      hints.some((hint) => designation.name.toLowerCase().includes(hint)),
    );
    if (matched) {
      return matched.id;
    }
  }

  return designations[0]!.id;
}

export function resolveDefaultBranchId(
  branches: Array<{ id: number }>,
): number | null {
  return branches[0]?.id ?? null;
}

export function resolveDefaultDepartmentId(
  departments: Array<{ id: number; name: string; branchId: number }>,
  branchId: number,
  roleCode?: string,
): number | null {
  const branchDepartments = departments.filter(
    (department) => !branchId || department.branchId === branchId,
  );

  if (!branchDepartments.length) {
    return null;
  }

  if (roleCode) {
    const hints = DEPARTMENT_HINTS_BY_ROLE[roleCode] ?? [];
    const matched = branchDepartments.find((department) =>
      hints.some((hint) => department.name.toLowerCase().includes(hint)),
    );
    if (matched) {
      return matched.id;
    }
  }

  return branchDepartments[0]!.id;
}

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
