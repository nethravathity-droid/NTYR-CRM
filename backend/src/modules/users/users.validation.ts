import { z } from "zod";

const userStatusSchema = z.enum(["ACTIVE", "INACTIVE", "LOCKED"]);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid user UUID"),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    branchId: z.coerce.number().int().positive().optional(),
    departmentId: z.coerce.number().int().positive().optional(),
    roleId: z.coerce.number().int().positive().optional(),
    status: userStatusSchema.optional(),
    sortBy: z
      .enum(["created_at", "first_name", "employee_code", "last_login_at"])
      .default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    branchId: z.number().int().positive("Branch is required"),
    departmentId: z.number().int().positive("Department is required"),
    designationId: z.number().int().positive("Designation is required"),
    roleId: z.number().int().positive("Role is required"),
    managerUserId: z.number().int().positive().nullable().optional(),
    employeeCode: z
      .string()
      .trim()
      .min(1, "Employee code is required")
      .max(20, "Employee code is too long"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(100, "Username is too long"),
    password: passwordSchema,
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(100, "First name is too long"),
    lastName: z.string().trim().max(100).nullable().optional(),
    displayName: z.string().trim().max(200).nullable().optional(),
    officialEmail: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255)
      .nullable()
      .optional(),
    mobile: z
      .string()
      .trim()
      .min(10, "Mobile number must be at least 10 digits")
      .max(20, "Mobile number is too long"),
    profilePhotoUrl: z.string().url("Invalid profile photo URL").nullable().optional(),
  }),
});

export const updateUserSchema = uuidParamSchema.extend({
  body: z
    .object({
      branchId: z.number().int().positive().optional(),
      departmentId: z.number().int().positive().optional(),
      designationId: z.number().int().positive().optional(),
      roleId: z.number().int().positive().optional(),
      managerUserId: z.number().int().positive().nullable().optional(),
      employeeCode: z.string().trim().min(1).max(20).optional(),
      username: z.string().trim().min(3).max(100).optional(),
      firstName: z.string().trim().min(1).max(100).optional(),
      lastName: z.string().trim().max(100).nullable().optional(),
      displayName: z.string().trim().max(200).nullable().optional(),
      officialEmail: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(255)
        .nullable()
        .optional(),
      mobile: z.string().trim().min(10).max(20).optional(),
      profilePhotoUrl: z.string().url("Invalid profile photo URL").nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const updateUserStatusSchema = uuidParamSchema.extend({
  body: z.object({
    status: userStatusSchema,
  }),
});

export const getUserSchema = uuidParamSchema;
export const deleteUserSchema = uuidParamSchema;

export const resetUserPasswordSchema = uuidParamSchema.extend({
  body: z.object({
    password: passwordSchema,
  }),
});

export const userFormOptionsSchema = z.object({
  query: z.object({
    branchId: z.coerce.number().int().positive().optional(),
    excludeUserId: z.coerce.number().int().positive().optional(),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type UpdateUserStatusInput = z.infer<
  typeof updateUserStatusSchema
>["body"];
export type ResetUserPasswordInput = z.infer<
  typeof resetUserPasswordSchema
>["body"];
export type UserFormOptionsQuery = z.infer<
  typeof userFormOptionsSchema
>["query"];
