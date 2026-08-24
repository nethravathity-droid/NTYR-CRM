import { z } from "zod";

export const loginFormSchema = z.object({
  companyCode: z.string().trim().min(1, "Company code is required"),
  loginId: z.string().trim().min(1, "Username or employee code is required"),
  password: z.string().trim().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
