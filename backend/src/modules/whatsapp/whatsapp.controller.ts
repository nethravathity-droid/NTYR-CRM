import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { WhatsAppService } from "./whatsapp.service.js";
import type {
  CreateWhatsAppMessageSchema,
  ListWhatsAppMessagesSchema,
  WhatsAppMessageParamsSchema,
} from "./whatsapp.validation.js";
import type { z } from "zod";

type ListRequest = Request & { validated: z.infer<typeof ListWhatsAppMessagesSchema> };
type CreateRequest = Request & { validated: z.infer<typeof CreateWhatsAppMessageSchema> };
type ParamsRequest = Request & { validated: z.infer<typeof WhatsAppMessageParamsSchema> };

export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  listMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await this.whatsappService.listMessages(query, companyId);

    res.status(200).json({
      success: true,
      message: "WhatsApp messages retrieved successfully",
      data: result,
    });
  });

  sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateRequest).validated;
    const companyId = (req as { user?: { companyId?: number; id?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const message = await this.whatsappService.createMessage({
      ...body,
      companyId,
      userId: userId,
      direction: "outbound",
      status: "queued",
    });

    res.status(201).json({
      success: true,
      message: "WhatsApp message queued successfully",
      data: { message },
    });
  });

  getMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ParamsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const message = await this.whatsappService.getMessage(params.uuid, companyId);

    res.status(200).json({
      success: true,
      message: "WhatsApp message retrieved successfully",
      data: { message },
    });
  });

  markSent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ParamsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    await this.whatsappService.markAsSent(companyId, params.uuid, params.externalId);

    res.status(200).json({
      success: true,
      message: "WhatsApp message marked as sent",
    });
  });

  markDelivered = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ParamsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    await this.whatsappService.markAsDelivered(companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "WhatsApp message marked as delivered",
    });
  });

  markRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ParamsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    await this.whatsappService.markAsRead(companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "WhatsApp message marked as read",
    });
  });

  deleteMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ParamsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;

    if (!companyId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    await this.whatsappService.deleteMessage(companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "WhatsApp message deleted successfully",
    });
  });
}
