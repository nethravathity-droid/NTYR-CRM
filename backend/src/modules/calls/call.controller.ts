import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { CallsService } from "./call.service.js";
import type {
  createCallSchema,
  deleteCallSchema,
  getCallSchema,
  getCallSummarySchema,
  getCallTimelineSchema,
  listCallsSchema,
  updateCallSchema,
} from "./call.validation.js";

type ListCallsRequest = Request & { validated: z.infer<typeof listCallsSchema> };
type CreateCallRequest = Request & { validated: z.infer<typeof createCallSchema> };
type GetCallRequest = Request & { validated: z.infer<typeof getCallSchema> };
type UpdateCallRequest = Request & { validated: z.infer<typeof updateCallSchema> };
type DeleteCallRequest = Request & { validated: z.infer<typeof deleteCallSchema> };
type GetCallTimelineRequest = Request & { validated: z.infer<typeof getCallTimelineSchema> };
type GetCallSummaryRequest = Request & { validated: z.infer<typeof getCallSummarySchema> };

export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListCallsRequest).validated;
    const result = await this.callsService.listCalls(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Calls retrieved successfully",
      data: result,
    });
  });

  summary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as GetCallSummaryRequest).validated;
    const summary = await this.callsService.getDashboardSummary(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Call summary retrieved successfully",
      data: summary,
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.callsService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Call form options retrieved successfully",
      data: options,
    });
  });

  getByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetCallRequest).validated;
    const call = await this.callsService.getCallByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Call retrieved successfully",
      data: { call },
    });
  });

  getTimeline = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetCallTimelineRequest).validated;
    const timeline = await this.callsService.getCallTimeline(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Call timeline retrieved successfully",
      data: timeline,
    });
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateCallRequest).validated;
    const call = await this.callsService.createCall(req.user!.companyId, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: call.followup ? "Call logged and follow-up created successfully" : "Call logged successfully",
      data: { call },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateCallRequest).validated;
    const call = await this.callsService.updateCall(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Call updated successfully",
      data: { call },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteCallRequest).validated;
    await this.callsService.deleteCall(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Call deleted successfully",
    });
  });
}
