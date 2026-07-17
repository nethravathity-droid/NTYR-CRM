import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { shouldRestrictToOwnRecords, withAssignedUserScope } from "../../common/utils/role-scope.js";
import type { FollowupsService } from "./followup.service.js";
import type {
  completeFollowupSchema,
  createFollowupSchema,
  deleteFollowupSchema,
  getFollowupSchema,
  listFollowupsSchema,
  calendarFollowupsSchema,
  rescheduleFollowupSchema,
  updateFollowupSchema,
} from "./followup.validation.js";

type ListFollowupsRequest = Request & { validated: z.infer<typeof listFollowupsSchema> };
type CalendarFollowupsRequest = Request & { validated: z.infer<typeof calendarFollowupsSchema> };
type CreateFollowupRequest = Request & { validated: z.infer<typeof createFollowupSchema> };
type GetFollowupRequest = Request & { validated: z.infer<typeof getFollowupSchema> };
type UpdateFollowupRequest = Request & { validated: z.infer<typeof updateFollowupSchema> };
type DeleteFollowupRequest = Request & { validated: z.infer<typeof deleteFollowupSchema> };
type CompleteFollowupRequest = Request & { validated: z.infer<typeof completeFollowupSchema> };
type RescheduleFollowupRequest = Request & { validated: z.infer<typeof rescheduleFollowupSchema> };

export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListFollowupsRequest).validated;
    const scopedQuery = withAssignedUserScope(req.user!.roleCode, req.user!.id, query);
    const result = await this.followupsService.listFollowups(req.user!.companyId, scopedQuery);

    res.status(200).json({
      success: true,
      message: "Follow-ups retrieved successfully",
      data: result,
    });
  });

  calendar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as CalendarFollowupsRequest).validated;
    const scopedQuery = withAssignedUserScope(req.user!.roleCode, req.user!.id, query);
    const followups = await this.followupsService.listFollowupsForCalendar(
      req.user!.companyId,
      scopedQuery,
    );

    res.status(200).json({
      success: true,
      message: "Follow-up calendar retrieved successfully",
      data: followups,
    });
  });

  getToday = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const assignedUserId = shouldRestrictToOwnRecords(req.user!.roleCode)
      ? req.user!.id
      : undefined;
    const followups = await this.followupsService.getTodayFollowups(req.user!.companyId, assignedUserId);

    res.status(200).json({
      success: true,
      message: "Today's follow-ups retrieved successfully",
      data: followups,
    });
  });

  getOverdue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const assignedUserId = shouldRestrictToOwnRecords(req.user!.roleCode)
      ? req.user!.id
      : undefined;
    const followups = await this.followupsService.getOverdueFollowups(req.user!.companyId, assignedUserId);

    res.status(200).json({
      success: true,
      message: "Overdue follow-ups retrieved successfully",
      data: followups,
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.followupsService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Follow-up form options retrieved successfully",
      data: options,
    });
  });

  getByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetFollowupRequest).validated;
    const followup = await this.followupsService.getFollowupByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Follow-up retrieved successfully",
      data: { followup },
    });
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateFollowupRequest).validated;
    const followup = await this.followupsService.createFollowup(req.user!.companyId, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      data: { followup },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateFollowupRequest).validated;
    const followup = await this.followupsService.updateFollowup(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      data: { followup },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteFollowupRequest).validated;
    await this.followupsService.deleteFollowup(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
    });
  });

  complete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as CompleteFollowupRequest).validated;
    const followup = await this.followupsService.completeFollowup(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Follow-up marked as completed",
      data: { followup },
    });
  });

  reschedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as RescheduleFollowupRequest).validated;
    const followup = await this.followupsService.rescheduleFollowup(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Follow-up rescheduled successfully",
      data: { followup },
    });
  });
}
