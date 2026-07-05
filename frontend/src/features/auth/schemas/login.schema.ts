import { z } from "zod";

export const loginFormSchema = z
  .object({
    companyCode: z.string().trim().min(1, "Company code is required"),
    loginType: z.enum(["username", "employeeCode"]),
    username: z.string().trim().optional(),
    employeeCode: z.string().trim().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.loginType === "username" && !data.username?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "Username is required",
      });
    }

    if (data.loginType === "employeeCode" && !data.employeeCode?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["employeeCode"],
        message: "Employee code is required",
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
