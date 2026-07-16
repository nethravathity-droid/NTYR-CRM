import { z } from "zod";

export const reportPeriodSchema = z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]);

export const reportTypeSchema = z.enum([
  "dashboard",
  "leads",
  "sales",
  "employees",
  "followups",
  "visits",
  "bookings",
  "payments",
]);

export const exportFormatSchema = z.enum(["csv", "xlsx", "pdf"]);

const reportFiltersQuery = z.object({
  period: reportPeriodSchema.default("monthly"),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  projectId: z.coerce.number().int().positive().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  assignedUserId: z.coerce.number().int().positive().optional(),
  leadSource: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const reportFiltersSchema = z.object({ query: reportFiltersQuery });

export const exportReportSchema = z.object({
  params: z.object({
    reportType: reportTypeSchema,
  }),
  query: reportFiltersQuery.extend({
    format: exportFormatSchema.default("xlsx"),
  }),
});

export type ReportFiltersQuery = z.infer<typeof reportFiltersQuery>;
