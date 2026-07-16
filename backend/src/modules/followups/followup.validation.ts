import { z } from "zod";

const followupTypeSchema = z.enum(["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT"]);
const followupPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
const followupStatusSchema = z.enum(["PENDING", "COMPLETED", "MISSED", "RESCHEDULED"]);
const reminderBeforeSchema = z.union([
  z.literal(5),
  z.literal(15),
  z.literal(30),
  z.literal(60),
]);

const followupBaseSchema = z.object({
  leadId: z.number().int().positive().nullable().optional(),
  customerName: z.string().trim().min(1, "Customer name is required").max(200),
  assignedUserId: z.number().int().positive().nullable().optional(),
  followupDate: z.string().min(1, "Follow-up date is required"),
  followupTime: z.string().min(1, "Follow-up time is required"),
  type: followupTypeSchema,
  priority: followupPrioritySchema.default("MEDIUM"),
  status: followupStatusSchema.default("PENDING"),
  notes: z.string().trim().max(4000).nullable().optional(),
  reminderBefore: z.coerce
    .number()
    .pipe(reminderBeforeSchema)
    .default(30),
  nextFollowupDate: z.string().nullable().optional(),
});

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid follow-up UUID"),
  }),
});

export const listFollowupsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: followupStatusSchema.optional(),
    priority: followupPrioritySchema.optional(),
    type: followupTypeSchema.optional(),
    assignedUserId: z.coerce.number().int().positive().optional(),
    leadId: z.coerce.number().int().positive().optional(),
    date: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    upcoming: z.coerce.boolean().optional(),
    overdue: z.coerce.boolean().optional(),
    sortBy: z.enum(["followup_date", "followup_time", "customer_name", "created_at"]).default("followup_date"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const createFollowupSchema = z.object({
  body: followupBaseSchema,
});

export const updateFollowupSchema = uuidParamSchema.extend({
  body: followupBaseSchema.partial(),
});

export const getFollowupSchema = uuidParamSchema;
export const deleteFollowupSchema = uuidParamSchema;
export const completeFollowupSchema = uuidParamSchema;
export const rescheduleFollowupSchema = uuidParamSchema.extend({
  body: z.object({
    followupDate: z.string().min(1, "Follow-up date is required"),
    followupTime: z.string().min(1, "Follow-up time is required"),
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
});

export type ListFollowupsQuery = z.infer<typeof listFollowupsSchema>["query"];
export type CreateFollowupInput = z.infer<typeof createFollowupSchema>["body"];
export type UpdateFollowupInput = z.infer<typeof updateFollowupSchema>["body"];
export type RescheduleFollowupInput = z.infer<typeof rescheduleFollowupSchema>["body"];
