import { z } from "zod";

const leadStatusSchema = z.enum([
  "NEW",
  "ASSIGNED",
  "CONTACTED",
  "FOLLOW_UP",
  "VISIT_SCHEDULED",
  "VISITED",
  "NEGOTIATION",
  "BOOKED",
  "LOST",
]);

const leadPrioritySchema = z.enum(["COLD", "WARM", "HOT"]);

const mobileSchema = z
  .string()
  .trim()
  .min(10, "Mobile number must be at least 10 digits")
  .max(20, "Mobile number is too long");

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid lead UUID"),
  }),
});

const leadBodyFields = {
  customerName: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(200, "Customer name is too long"),
  mobile: mobileSchema,
  alternateMobile: z
    .string()
    .trim()
    .min(10)
    .max(20)
    .nullable()
    .optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255)
    .nullable()
    .optional(),
  projectInterested: z.string().trim().max(200).nullable().optional(),
  budget: z.number().nonnegative().nullable().optional(),
  propertyType: z.string().trim().max(100).nullable().optional(),
  leadSource: z.string().trim().max(100).nullable().optional(),
  campaign: z.string().trim().max(150).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  assignedUserId: z.number().int().positive().nullable().optional(),
  priority: leadPrioritySchema.optional(),
  status: leadStatusSchema.optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
};

export const listLeadsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: leadStatusSchema.optional(),
    priority: leadPrioritySchema.optional(),
    assignedUserId: z.coerce.number().int().positive().optional(),
    leadSource: z.string().trim().max(100).optional(),
    propertyType: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    campaign: z.string().trim().max(150).optional(),
    fromDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "fromDate must be YYYY-MM-DD")
      .optional(),
    toDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "toDate must be YYYY-MM-DD")
      .optional(),
    sortBy: z
      .enum([
        "created_at",
        "updated_at",
        "customer_name",
        "lead_number",
        "budget",
        "status",
        "priority",
      ])
      .default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createLeadSchema = z.object({
  body: z.object(leadBodyFields),
});

export const updateLeadSchema = uuidParamSchema.extend({
  body: z.object({
    customerName: leadBodyFields.customerName.optional(),
    mobile: mobileSchema.optional(),
    alternateMobile: leadBodyFields.alternateMobile,
    email: leadBodyFields.email,
    projectInterested: leadBodyFields.projectInterested,
    budget: leadBodyFields.budget,
    propertyType: leadBodyFields.propertyType,
    leadSource: leadBodyFields.leadSource,
    campaign: leadBodyFields.campaign,
    city: leadBodyFields.city,
    assignedUserId: leadBodyFields.assignedUserId,
    priority: leadBodyFields.priority,
    status: leadBodyFields.status,
    notes: leadBodyFields.notes,
  }),
});

export const getLeadSchema = uuidParamSchema;

export const deleteLeadSchema = uuidParamSchema;

export const checkDuplicateSchema = z.object({
  query: z.object({
    mobile: z.string().trim().optional(),
    email: z.string().trim().email().optional(),
    excludeUuid: z.string().uuid().optional(),
  }),
});

export const assignLeadsSchema = z.object({
  body: z.object({
    leadUuids: z
      .array(z.string().uuid())
      .min(1, "At least one lead is required")
      .max(500),
    assignedUserId: z.number().int().positive("Assigned employee is required"),
  }),
});

export const bulkUpdateLeadsSchema = z.object({
  body: z.object({
    leadUuids: z
      .array(z.string().uuid())
      .min(1, "At least one lead is required")
      .max(500),
    status: leadStatusSchema.optional(),
    priority: leadPrioritySchema.optional(),
    assignedUserId: z.number().int().positive().nullable().optional(),
  }),
});

export const leadFormOptionsSchema = z.object({
  query: z.object({}).optional(),
});

export const getLeadAuditSchema = uuidParamSchema;

export type ListLeadsQuery = z.infer<typeof listLeadsSchema>["query"];
export type CreateLeadInput = z.infer<typeof createLeadSchema>["body"];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>["body"];
export type AssignLeadsInput = z.infer<typeof assignLeadsSchema>["body"];
export type BulkUpdateLeadsInput = z.infer<typeof bulkUpdateLeadsSchema>["body"];
export type CheckDuplicateQuery = z.infer<typeof checkDuplicateSchema>["query"];
