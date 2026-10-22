import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const registerFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
    companyName: z.string().trim().min(2, "Company name is required").max(200),
    companyCode: z
      .string()
      .trim()
      .min(2, "Company code must be at least 2 characters")
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores"),
    addressLine1: z.string().trim().min(3, "Office address is required").max(255),
    city: z.string().trim().min(2, "City is required").max(100),
    state: z.string().trim().min(2, "State is required").max(100),
    country: z.string().trim().min(2, "Country is required").max(100),
    postalCode: z.string().trim().min(3, "PIN / postal code is required").max(20),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9._-]+$/, "Invalid username format"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((value) => value === true, "You must agree to the terms"),
    agreePrivacy: z
      .boolean()
      .refine((value) => value === true, "You must agree to the privacy policy"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
