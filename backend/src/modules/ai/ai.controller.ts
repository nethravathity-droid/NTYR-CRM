import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { AiService } from "./ai.service.js";
import type { AiChatSchema, ListConversationsSchema } from "./ai.validation.js";
import type { z } from "zod";

type ChatRequest = Request & { validated: z.infer<typeof AiChatSchema> };
type ListRequest = Request & { validated: z.infer<typeof ListConversationsSchema> };

export class AiController {
  constructor(private readonly aiService: AiService) {}

  chat = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as ChatRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId || !userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await this.aiService.chat(body, companyId, userId);

    res.status(200).json({
      success: true,
      message: "AI response generated",
      data: result,
    });
  });

  listConversations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId || !userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const conversations = await this.aiService.listConversations(companyId, userId);

    res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  });
}
