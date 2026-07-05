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

export const loginSchema = z.object({
  body: z.object({
    companyCode: z
      .string()
      .trim()
      .min(1, "Company code is required")
      .max(50, "Company code is too long"),
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .max(100, "Username is too long"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password is too long"),
  }),
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
export type LogoutInput = z.infer<typeof logoutSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
