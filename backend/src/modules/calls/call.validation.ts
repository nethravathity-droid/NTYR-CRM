import { z } from "zod";

const callDirectionSchema = z.enum(["INCOMING", "OUTGOING", "MISSED"]);
const callStatusSchema = z.enum(["ANSWERED", "BUSY", "NO_ANSWER", "SWITCHED_OFF", "WRONG_NUMBER"]);

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid call UUID"),
  }),
});

const callFieldsSchema = z.object({
  leadId: z.number().int().positive().nullable().optional(),
  customerName: z.string().trim().min(1).max(200),
  mobile: z.string().trim().min(5).max(20),
  direction: callDirectionSchema,
  callStatus: callStatusSchema,
  callDate: z.string().min(1),
  callTime: z.string().min(1),
  durationSeconds: z.coerce.number().int().min(0).default(0),
  assignedUserId: z.number().int().positive().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  autoCreateFollowup: z.coerce.boolean().default(false),
  nextFollowupDate: z.string().nullable().optional(),
  nextFollowupTime: z.string().nullable().optional(),
});

export const listCallsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    direction: callDirectionSchema.optional(),
    callStatus: callStatusSchema.optional(),
    assignedUserId: z.coerce.number().int().positive().optional(),
    leadId: z.coerce.number().int().positive().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    sortBy: z.enum(["call_date", "call_time", "customer_name", "created_at", "duration_seconds"]).default("call_date"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createCallSchema = z.object({
  body: callFieldsSchema.superRefine((data, ctx) => {
    if (data.autoCreateFollowup) {
      if (!data.nextFollowupDate) {
        ctx.addIssue({ code: "custom", message: "Next follow-up date is required when auto-create is enabled", path: ["nextFollowupDate"] });
      }
      if (!data.nextFollowupTime) {
        ctx.addIssue({ code: "custom", message: "Next follow-up time is required when auto-create is enabled", path: ["nextFollowupTime"] });
      }
    }
  }),
});

export const updateCallSchema = uuidParamSchema.extend({
  body: callFieldsSchema.partial(),
});

export const getCallSchema = uuidParamSchema;
export const deleteCallSchema = uuidParamSchema;
export const getCallTimelineSchema = uuidParamSchema;
export const getCallSummarySchema = z.object({
  query: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  }),
});

export type ListCallsQuery = z.infer<typeof listCallsSchema>["query"];
export type CreateCallInput = z.infer<typeof createCallSchema>["body"];
export type UpdateCallInput = z.infer<typeof updateCallSchema>["body"];
export type CallSummaryQuery = z.infer<typeof getCallSummarySchema>["query"];
