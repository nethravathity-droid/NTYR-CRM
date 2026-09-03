import { z } from "zod";

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

export const loginSchema = z
  .object({
    body: z.object({
      companyCode: z
        .string()
        .trim()
        .min(1, "Company code is required")
        .max(50, "Company code is too long"),
      password: z
        .string()
        .min(1, "Password is required")
        .max(128, "Password is too long"),
      username: z
        .string()
        .trim()
        .min(1, "Username cannot be empty")
        .max(100, "Username is too long")
        .optional(),
      employeeCode: z
        .string()
        .trim()
        .min(1, "Employee code cannot be empty")
        .max(20, "Employee code is too long")
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const hasUsername = Boolean(data.body.username);
    const hasEmployeeCode = Boolean(data.body.employeeCode);

    if (!hasUsername && !hasEmployeeCode) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "username"],
        message: "Either username or employeeCode is required",
      });
    }

    if (hasUsername && hasEmployeeCode) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "employeeCode"],
        message: "Provide either username or employeeCode, not both",
      });
    }
  });

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const changePasswordSchema = z
  .object({
    body: z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1, "Password confirmation is required"),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.body.newPassword !== data.body.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "confirmPassword"],
        message: "Password confirmation does not match new password",
      });
    }
    if (data.body.currentPassword === data.body.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "newPassword"],
        message: "New password must be different from current password",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type LogoutTokenInput = z.infer<typeof logoutSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];

const companyStatusSchema = z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED"]);

export const registerSchema = z.object({
  body: z.object({
    companyCode: z
      .string()
      .trim()
      .min(2, "Company code must be at least 2 characters")
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/, "Invalid company code format"),
    companyName: z.string().trim().min(2).max(200),
    ownerName: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(10).max(20),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    country: z.string().trim().max(100).default("India"),
    postalCode: z.string().trim().min(3).max(20),
    addressLine1: z.string().trim().min(3).max(255),
    addressLine2: z.string().trim().max(255).optional().or(z.literal("").transform(() => undefined)),
    legalName: z.string().trim().max(250).optional().or(z.literal("").transform(() => undefined)),
    gstNumber: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
    panNumber: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
    reraNumber: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
    website: z.string().trim().url().max(255).optional().or(z.literal("").transform(() => undefined)),
    timezone: z.string().trim().max(50).default("Asia/Kolkata"),
    currency: z.string().trim().max(10).default("INR"),
    trialStartDate: z.string().date().optional().or(z.literal("").transform(() => undefined)),
    trialEndDate: z.string().date().optional().or(z.literal("").transform(() => undefined)),
    notes: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9._-]+$/, "Invalid username format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    employeeCode: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    firstName: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
    lastName: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
    displayName: z.string().trim().max(150).optional().or(z.literal("").transform(() => undefined)),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    companyCode: z.string().trim().min(1, "Company code is required").max(50),
    email: z.string().trim().email("Enter a valid email").max(255),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
