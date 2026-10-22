import { z } from "zod";

export const ListWhatsAppMessagesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    search: z.string().trim().max(100).optional(),
    direction: z.enum(["inbound", "outbound"]).optional(),
    status: z.enum(["queued", "sent", "delivered", "read", "failed"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    leadId: z.coerce.number().int().positive().optional(),
  }),
});

export const CreateWhatsAppMessageSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(1, "Customer name is required").max(150),
    customerMobile: z.string().trim().min(7, "Valid mobile number is required").max(20),
    leadId: z.coerce.number().int().positive().optional(),
    templateId: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
    body: z.string().trim().min(1, "Message body is required").max(4000),
    mediaUrl: z.string().trim().url().max(500).optional().or(z.literal("").transform(() => undefined)),
  }),
});

export const WhatsAppMessageParamsSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid message UUID"),
    externalId: z.string().trim().max(100).optional(),
  }),
});

export type ListWhatsAppMessagesQuery = z.infer<typeof ListWhatsAppMessagesSchema>["query"];
export type CreateWhatsAppMessageInput = z.infer<typeof CreateWhatsAppMessageSchema>["body"];
