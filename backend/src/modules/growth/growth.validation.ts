import { z } from "zod";

const channelSchema = z.enum(["EMAIL", "SMS", "WHATSAPP"]);

export const listTemplatesSchema = z.object({
  query: z.object({
    channel: channelSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    channel: channelSchema,
    subject: z.string().max(500).optional().nullable(),
    body: z.string().min(1),
  }),
});

export const updateTemplateSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createTemplateSchema.shape.body.partial(),
});

export const deleteTemplateSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
});

export const listCampaignsSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    channel: channelSchema,
    templateUuid: z.string().uuid().optional().nullable(),
    audienceFilter: z.record(z.string(), z.unknown()).optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
  }),
});

export const updateCampaignSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createCampaignSchema.shape.body.partial().extend({
    status: z.enum(["DRAFT", "SCHEDULED", "RUNNING", "COMPLETED", "CANCELLED"]).optional(),
  }),
});

export const runCampaignSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
});

export const listWorkflowsSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    triggerType: z.string().min(1).max(40),
    triggerConfig: z.record(z.string(), z.unknown()).optional(),
    actions: z.array(z.record(z.string(), z.unknown())).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  }),
});

export const updateWorkflowSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createWorkflowSchema.shape.body.partial().extend({
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  }),
});

export const listFormsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createFormSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    fields: z.array(z.record(z.string(), z.unknown())).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const updateFormSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createFormSchema.shape.body.partial().extend({
    status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  }),
});

export const publicFormSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
});

export const submitFormSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: z.record(z.string(), z.unknown()),
});

export const listFunnelsSchema = listFormsSchema;
export const createFunnelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    stages: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
});

export const updateFunnelSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createFunnelSchema.shape.body.partial().extend({
    status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  }),
});

export const listAppointmentsSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export const createAppointmentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300),
    description: z.string().optional().nullable(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    leadUuid: z.string().uuid().optional().nullable(),
    assignedUserUuid: z.string().uuid().optional().nullable(),
    location: z.string().optional().nullable(),
  }),
});

export const updateAppointmentSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createAppointmentSchema.shape.body.partial().extend({
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  }),
});

export const listReviewsSchema = listFormsSchema;
export const createReviewSchema = z.object({
  body: z.object({
    reviewerName: z.string().min(1).max(200),
    reviewerEmail: z.string().email().optional().nullable(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().optional().nullable(),
    source: z.string().max(50).optional(),
    leadUuid: z.string().uuid().optional().nullable(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: createReviewSchema.shape.body.partial().extend({
    status: z.enum(["PUBLISHED", "HIDDEN", "PENDING"]).optional(),
  }),
});

export const inboxSchema = z.object({
  query: z.object({
    channel: channelSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export const inboxThreadSchema = z.object({
  query: z.object({
    channel: channelSchema,
    recipient: z.string().min(1),
    limit: z.coerce.number().int().min(1).max(200).default(100),
  }),
});

export const inboxReplySchema = z.object({
  body: z.object({
    channel: channelSchema,
    recipient: z.string().min(1),
    body: z.string().min(1).max(4000),
    customerName: z.string().min(1).max(200),
    leadUuid: z.string().uuid().optional().nullable(),
  }),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>["body"];
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>["body"];
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>["body"];
export type CreateFormInput = z.infer<typeof createFormSchema>["body"];
export type CreateFunnelInput = z.infer<typeof createFunnelSchema>["body"];
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>["body"];
export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
