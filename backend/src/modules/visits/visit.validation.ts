import { z } from "zod";

const visitStatusSchema = z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);
const ratingSchema = z.number().int().min(1).max(5);

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid visit UUID"),
  }),
});

const visitBaseSchema = z.object({
  leadId: z.number().int().positive().nullable().optional(),
  customerName: z.string().trim().min(1).max(200),
  mobile: z.string().trim().min(5).max(20),
  projectId: z.number().int().positive().nullable().optional(),
  unitId: z.number().int().positive().nullable().optional(),
  visitDate: z.string().min(1),
  visitTime: z.string().min(1),
  assignedUserId: z.number().int().positive().nullable().optional(),
  status: visitStatusSchema.default("SCHEDULED"),
  transportationRequired: z.coerce.boolean().default(false),
  pickupLocation: z.string().trim().max(500).nullable().optional(),
  feedback: z.string().trim().max(4000).nullable().optional(),
  rating: ratingSchema.nullable().optional(),
  nextAction: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export const calendarVisitsSchema = z.object({
  query: z.object({
    fromDate: z.string().min(1, "fromDate is required"),
    toDate: z.string().min(1, "toDate is required"),
    assignedUserId: z.coerce.number().int().positive().optional(),
  }),
});

export const listVisitsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: visitStatusSchema.optional(),
    assignedUserId: z.coerce.number().int().positive().optional(),
    projectId: z.coerce.number().int().positive().optional(),
    leadId: z.coerce.number().int().positive().optional(),
    date: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    sortBy: z.enum(["visit_date", "visit_time", "customer_name", "created_at", "status"]).default("visit_date"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const createVisitSchema = z.object({ body: visitBaseSchema });
export const updateVisitSchema = uuidParamSchema.extend({ body: visitBaseSchema.partial() });
export const getVisitSchema = uuidParamSchema;
export const deleteVisitSchema = uuidParamSchema;
export const getVisitAuditSchema = uuidParamSchema;

export const completeVisitSchema = uuidParamSchema.extend({
  body: z.object({
    feedback: z.string().trim().max(4000).nullable().optional(),
    rating: ratingSchema.nullable().optional(),
    nextAction: z.string().trim().max(500).nullable().optional(),
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
});

export const cancelVisitSchema = uuidParamSchema.extend({
  body: z.object({
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
});

export type ListVisitsQuery = z.infer<typeof listVisitsSchema>["query"];
export type CalendarVisitsQuery = z.infer<typeof calendarVisitsSchema>["query"];
export type CreateVisitInput = z.infer<typeof createVisitSchema>["body"];
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>["body"];
export type CompleteVisitInput = z.infer<typeof completeVisitSchema>["body"];
export type CancelVisitInput = z.infer<typeof cancelVisitSchema>["body"];
