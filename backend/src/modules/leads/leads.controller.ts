import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { withAssignedUserScope } from "../../common/utils/role-scope.js";
import type { LeadsService } from "./leads.service.js";
import type {
  assignLeadsSchema,
  bulkUpdateLeadsSchema,
  checkDuplicateSchema,
  createLeadSchema,
  deleteLeadSchema,
  getLeadAuditSchema,
  getLeadSchema,
  listLeadsSchema,
  updateLeadSchema,
} from "./leads.validation.js";

type ListLeadsRequest = Request & {
  validated: z.infer<typeof listLeadsSchema>;
};
type CreateLeadRequest = Request & {
  validated: z.infer<typeof createLeadSchema>;
};
type GetLeadRequest = Request & { validated: z.infer<typeof getLeadSchema> };
type UpdateLeadRequest = Request & {
  validated: z.infer<typeof updateLeadSchema>;
};
type DeleteLeadRequest = Request & {
  validated: z.infer<typeof deleteLeadSchema>;
};
type AssignLeadsRequest = Request & {
  validated: z.infer<typeof assignLeadsSchema>;
};
type BulkUpdateLeadsRequest = Request & {
  validated: z.infer<typeof bulkUpdateLeadsSchema>;
};
type CheckDuplicateRequest = Request & {
  validated: z.infer<typeof checkDuplicateSchema>;
};
type GetLeadAuditRequest = Request & {
  validated: z.infer<typeof getLeadAuditSchema>;
};

export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListLeadsRequest).validated;
    const scopedQuery = withAssignedUserScope(req.user!.roleCode, req.user!.id, query);

    const result = await this.leadsService.listLeads(req.user!.companyId, scopedQuery);

    res.status(200).json({
      success: true,
      message: "Leads retrieved successfully",
      data: result,
    });
  });

  getFormOptions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const options = await this.leadsService.getFormOptions(req.user!.companyId);

      res.status(200).json({
        success: true,
        message: "Lead form options retrieved successfully",
        data: options,
      });
    },
  );

  checkDuplicates = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { query } = (req as CheckDuplicateRequest).validated;

      const result = await this.leadsService.checkDuplicates(
        req.user!.companyId,
        query,
      );

      res.status(200).json({
        success: true,
        message: "Duplicate check completed",
        data: result,
      });
    },
  );

  getByUuid = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params } = (req as GetLeadRequest).validated;

      const lead = await this.leadsService.getLeadByUuid(
        req.user!.companyId,
        params.uuid,
      );

      res.status(200).json({
        success: true,
        message: "Lead retrieved successfully",
        data: { lead },
      });
    },
  );

  getAuditTrail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params } = (req as GetLeadAuditRequest).validated;

      const auditTrail = await this.leadsService.getAuditTrail(
        req.user!.companyId,
        params.uuid,
      );

      res.status(200).json({
        success: true,
        message: "Lead audit trail retrieved successfully",
        data: { auditTrail },
      });
    },
  );

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateLeadRequest).validated;

    const lead = await this.leadsService.createLead(
      req.user!.companyId,
      body,
      req.user!.id,
    );

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: { lead },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateLeadRequest).validated;

    const lead = await this.leadsService.updateLead(
      req.user!.companyId,
      params.uuid,
      body,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: { lead },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteLeadRequest).validated;

    await this.leadsService.deleteLead(
      req.user!.companyId,
      params.uuid,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  });

  assign = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as AssignLeadsRequest).validated;

    const result = await this.leadsService.assignLeads(
      req.user!.companyId,
      body,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: "Leads assigned successfully",
      data: result,
    });
  });

  bulkUpdate = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { body } = (req as BulkUpdateLeadsRequest).validated;

      const result = await this.leadsService.bulkUpdateLeads(
        req.user!.companyId,
        body,
        req.user!.id,
      );

      res.status(200).json({
        success: true,
        message: "Leads updated successfully",
        data: result,
      });
    },
  );

  importLeads = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "Import file is required",
        });
        return;
      }

      const skipDuplicates = req.body.skipDuplicates !== "false";

      const result = await this.leadsService.importLeads(
        req.user!.companyId,
        file.buffer,
        file.originalname,
        req.user!.id,
        skipDuplicates,
      );

      res.status(200).json({
        success: true,
        message: "Lead import completed",
        data: result,
      });
    },
  );
}
