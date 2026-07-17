import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { withAssignedUserScope } from "../../common/utils/role-scope.js";
import type { VisitsService } from "./visit.service.js";
import type {
  cancelVisitSchema,
  completeVisitSchema,
  calendarVisitsSchema,
  createVisitSchema,
  deleteVisitSchema,
  getVisitAuditSchema,
  getVisitSchema,
  listVisitsSchema,
  updateVisitSchema,
} from "./visit.validation.js";

type ListVisitsRequest = Request & { validated: z.infer<typeof listVisitsSchema> };
type CalendarVisitsRequest = Request & { validated: z.infer<typeof calendarVisitsSchema> };
type CreateVisitRequest = Request & { validated: z.infer<typeof createVisitSchema> };
type GetVisitRequest = Request & { validated: z.infer<typeof getVisitSchema> };
type UpdateVisitRequest = Request & { validated: z.infer<typeof updateVisitSchema> };
type DeleteVisitRequest = Request & { validated: z.infer<typeof deleteVisitSchema> };
type CompleteVisitRequest = Request & { validated: z.infer<typeof completeVisitSchema> };
type CancelVisitRequest = Request & { validated: z.infer<typeof cancelVisitSchema> };
type GetVisitAuditRequest = Request & { validated: z.infer<typeof getVisitAuditSchema> };

export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListVisitsRequest).validated;
    const scopedQuery = withAssignedUserScope(req.user!.roleCode, req.user!.id, query);
    const result = await this.visitsService.listVisits(req.user!.companyId, scopedQuery);

    res.status(200).json({
      success: true,
      message: "Visits retrieved successfully",
      data: result,
    });
  });

  calendar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as CalendarVisitsRequest).validated;
    const scopedQuery = withAssignedUserScope(req.user!.roleCode, req.user!.id, query);
    const visits = await this.visitsService.listVisitsForCalendar(req.user!.companyId, scopedQuery);

    res.status(200).json({
      success: true,
      message: "Visit calendar retrieved successfully",
      data: visits,
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.visitsService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Visit form options retrieved successfully",
      data: options,
    });
  });

  getByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetVisitRequest).validated;
    const visit = await this.visitsService.getVisitByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Visit retrieved successfully",
      data: { visit },
    });
  });

  getAuditTrail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetVisitAuditRequest).validated;
    const auditTrail = await this.visitsService.getAuditTrail(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Visit audit trail retrieved successfully",
      data: { auditTrail },
    });
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateVisitRequest).validated;
    const visit = await this.visitsService.createVisit(req.user!.companyId, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Visit scheduled successfully",
      data: { visit },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateVisitRequest).validated;
    const visit = await this.visitsService.updateVisit(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Visit updated successfully",
      data: { visit },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteVisitRequest).validated;
    await this.visitsService.deleteVisit(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Visit deleted successfully",
    });
  });

  complete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as CompleteVisitRequest).validated;
    const visit = await this.visitsService.completeVisit(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Visit marked as completed",
      data: { visit },
    });
  });

  cancel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as CancelVisitRequest).validated;
    const visit = await this.visitsService.cancelVisit(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Visit cancelled successfully",
      data: { visit },
    });
  });
}
