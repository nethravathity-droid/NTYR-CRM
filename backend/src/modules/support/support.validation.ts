import { z } from "zod";

const uuidParamSchema = z.object({
  params: z.object({
    companyUuid: z.string().uuid("Invalid company UUID"),
  }),
});

export const listCompanyThreadsSchema = z.object({
  query: z.object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
  }),
});

export const listThreadMessagesSchema = uuidParamSchema;

export const sendThreadMessageSchema = uuidParamSchema.extend({
  body: z.object({
    body: z.string().trim().min(1, "Message cannot be empty").max(4000),
  }),
});

export const broadcastMessageSchema = z.object({
  body: z.object({
    body: z.string().trim().min(1, "Message cannot be empty").max(4000),
    companyIds: z.array(z.number().int().positive()).optional(),
  }),
});

export const markThreadReadSchema = uuidParamSchema;

export type ListCompanyThreadsQuery = z.infer<typeof listCompanyThreadsSchema>["query"];
export type SendThreadMessageInput = z.infer<typeof sendThreadMessageSchema>["body"];
