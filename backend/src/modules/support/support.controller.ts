import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { SupportService } from "./support.service.js";
import type {
  listCompanyThreadsSchema,
  listThreadMessagesSchema,
  markThreadReadSchema,
  sendThreadMessageSchema,
  broadcastMessageSchema,
} from "./support.validation.js";

type ListThreadsRequest = Request & { validated: z.infer<typeof listCompanyThreadsSchema> };
type ThreadParamsRequest = Request & {
  validated: z.infer<typeof listThreadMessagesSchema> | z.infer<typeof markThreadReadSchema>;
};
type SendMessageRequest = Request & { validated: z.infer<typeof sendThreadMessageSchema> };
type BroadcastRequest = Request & { validated: z.infer<typeof broadcastMessageSchema> };

export class SupportController {
  constructor(private readonly supportService: SupportService) { }

  listThreads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListThreadsRequest).validated;
    const result = await this.supportService.listCompanyThreads(query);

    res.status(200).json({
      success: true,
      message: "Company threads retrieved successfully",
      data: result,
    });
  });

  listMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ThreadParamsRequest).validated as z.infer<typeof listThreadMessagesSchema>;
    const result = await this.supportService.listThreadMessages(params.companyUuid);

    res.status(200).json({
      success: true,
      message: "Thread messages retrieved successfully",
      data: result,
    });
  });

  sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as SendMessageRequest).validated;
    const message = await this.supportService.sendThreadMessage(
      params.companyUuid,
      body.body,
      { id: req.user!.id, role: req.user!.roleCode },
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  });

  markRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as ThreadParamsRequest).validated as z.infer<typeof markThreadReadSchema>;
    await this.supportService.markThreadRead(params.companyUuid, req.user!.roleCode);

    res.status(200).json({
      success: true,
      message: "Thread marked as read",
    });
  });

  broadcast = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as BroadcastRequest).validated;
    const count = await this.supportService.broadcastMessage(body.body, {
      id: req.user!.id,
    });

    res.status(200).json({
      success: true,
      message: `Message broadcasted to ${count} companies`,
      data: { count },
    });
  });
}
