import { z } from "zod";

export const AiChatSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, "Message is required").max(2000),
    conversationId: z.string().uuid().optional(),
  }),
});

export const ListConversationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export type AiChatInput = z.infer<typeof AiChatSchema>["body"];
export type ListConversationsQuery = z.infer<typeof ListConversationsSchema>["query"];
