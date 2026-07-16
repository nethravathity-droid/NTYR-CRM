import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { ReportsService } from "./reports.service.js";
import type { exportReportSchema, reportFiltersSchema } from "./reports.validation.js";

type ReportFiltersRequest = Request & { validated: z.infer<typeof reportFiltersSchema> };
type ExportReportRequest = Request & { validated: z.infer<typeof exportReportSchema> };

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  dashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getDashboard(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Dashboard report retrieved", data });
  });

  leads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getLeadReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Lead report retrieved", data });
  });

  sales = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getSalesReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Sales report retrieved", data });
  });

  employees = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getEmployeeReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Employee report retrieved", data });
  });

  followups = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getFollowupReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Follow-up report retrieved", data });
  });

  visits = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getVisitReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Visit report retrieved", data });
  });

  bookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getBookingReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Booking report retrieved", data });
  });

  payments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ReportFiltersRequest).validated;
    const data = await this.reportsService.getPaymentReport(req.user!.companyId, query);
    res.status(200).json({ success: true, message: "Payment report retrieved", data });
  });

  exportReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, query } = (req as ExportReportRequest).validated;
    const file = await this.reportsService.exportReport(
      req.user!.companyId,
      params.reportType,
      query.format,
      query,
    );

    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.status(200).send(file.body);
  });
}
