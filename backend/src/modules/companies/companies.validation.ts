import { z } from "zod";

const companyStatusSchema = z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED"]);

const companyBodySchema = z.object({
  companyCode: z
    .string()
    .trim()
    .min(2, "Company code must be at least 2 characters")
    .max(50, "Company code is too long")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Company code may only contain letters, numbers, hyphens, and underscores",
    ),
  companyName: z.string().trim().min(2).max(200),
  legalName: z.string().trim().max(250).nullable().optional(),
  ownerName: z.string().trim().min(2).max(150),
  gstNumber: z.string().trim().max(20).nullable().optional(),
  panNumber: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  reraNumber: z.string().trim().max(50).nullable().optional(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(20),
  alternatePhone: z.string().trim().max(20).nullable().optional(),
  website: z.string().trim().url().max(255).nullable().optional().or(z.literal("").transform(() => null)),
  addressLine1: z.string().trim().min(3).max(255),
  addressLine2: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100).default("India"),
  postalCode: z.string().trim().min(3).max(20),
  logoUrl: z.string().trim().url().nullable().optional().or(z.literal("").transform(() => null)),
  faviconUrl: z.string().trim().url().nullable().optional().or(z.literal("").transform(() => null)),
  timezone: z.string().trim().max(50).default("Asia/Kolkata"),
  currency: z.string().trim().max(10).default("INR"),
  status: companyStatusSchema.default("TRIAL"),
  trialStartDate: z.string().date().nullable().optional(),
  trialEndDate: z.string().date().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid company UUID"),
  }),
});

export const listCompaniesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: companyStatusSchema.optional(),
    sortBy: z
      .enum(["created_at", "company_name", "company_code", "status"])
      .default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createCompanySchema = z.object({
  body: companyBodySchema,
});

export const updateCompanySchema = uuidParamSchema.extend({
  body: companyBodySchema.partial().refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const updateCompanyStatusSchema = uuidParamSchema.extend({
  body: z.object({
    status: companyStatusSchema,
  }),
});

export const getCompanySchema = uuidParamSchema;
export const deleteCompanySchema = uuidParamSchema;

export type ListCompaniesQuery = z.infer<typeof listCompaniesSchema>["query"];
export type CreateCompanyInput = z.infer<typeof createCompanySchema>["body"];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>["body"];
export type UpdateCompanyStatusInput = z.infer<
  typeof updateCompanyStatusSchema
>["body"];
