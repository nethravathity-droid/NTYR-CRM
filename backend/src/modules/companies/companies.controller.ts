import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { CompaniesService } from "./companies.service.js";
import type {
  createCompanySchema,
  deleteCompanySchema,
  getCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
  updateCompanyStatusSchema,
} from "./companies.validation.js";

type ListCompaniesRequest = Request & {
  validated: z.infer<typeof listCompaniesSchema>;
};
type CreateCompanyRequest = Request & {
  validated: z.infer<typeof createCompanySchema>;
};
type GetCompanyRequest = Request & {
  validated: z.infer<typeof getCompanySchema>;
};
type UpdateCompanyRequest = Request & {
  validated: z.infer<typeof updateCompanySchema>;
};
type UpdateCompanyStatusRequest = Request & {
  validated: z.infer<typeof updateCompanyStatusSchema>;
};
type DeleteCompanyRequest = Request & {
  validated: z.infer<typeof deleteCompanySchema>;
};

export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListCompaniesRequest).validated;

    const result = await this.companiesService.listCompanies(query);

    res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: result,
    });
  });

  getByUuid = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params } = (req as GetCompanyRequest).validated;

      const company = await this.companiesService.getCompanyByUuid(params.uuid);

      res.status(200).json({
        success: true,
        message: "Company retrieved successfully",
        data: { company },
      });
    },
  );

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateCompanyRequest).validated;

    const company = await this.companiesService.createCompany(
      body,
      req.user!.id,
    );

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: { company },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateCompanyRequest).validated;

    const company = await this.companiesService.updateCompany(
      params.uuid,
      body,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: { company },
    });
  });

  updateStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params, body } = (req as UpdateCompanyStatusRequest).validated;

      const company = await this.companiesService.updateCompanyStatus(
        params.uuid,
        body,
        req.user!.id,
      );

      res.status(200).json({
        success: true,
        message: "Company status updated successfully",
        data: { company },
      });
    },
  );

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteCompanyRequest).validated;

    await this.companiesService.deleteCompany(params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  });
}
