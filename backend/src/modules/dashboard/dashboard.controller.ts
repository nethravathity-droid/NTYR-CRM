import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { DashboardService } from "./dashboard.service.js";
import type {
  DashboardChartMetric,
  DashboardChartRange,
} from "./dashboard.types.js";

const CHART_METRICS: DashboardChartMetric[] = [
  "leads",
  "bookings",
  "revenue",
  "employees",
];

const CHART_RANGES: DashboardChartRange[] = ["7d", "30d", "6m", "12m"];

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const context = this.dashboardService.buildContext(
      req.user!.companyId,
      req.user!.companyCode,
      req.user!.permissions,
    );

    const summary = await this.dashboardService.getSummary(context);

    res.status(200).json({
      success: true,
      message: "Dashboard summary retrieved successfully",
      data: summary,
    });
  });

  getRecentActivities = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const context = this.dashboardService.buildContext(
        req.user!.companyId,
        req.user!.companyCode,
        req.user!.permissions,
      );

      const limit = this.parseLimit(req.query.limit);
      const activities = await this.dashboardService.getRecentActivities(
        context,
        limit,
      );

      res.status(200).json({
        success: true,
        message: "Recent activities retrieved successfully",
        data: { activities },
      });
    },
  );

  getChart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const context = this.dashboardService.buildContext(
      req.user!.companyId,
      req.user!.companyCode,
      req.user!.permissions,
    );

    const metric = this.parseMetric(req.query.metric);
    const range = this.parseRange(req.query.range);

    const chart = await this.dashboardService.getChart(context, metric, range);

    res.status(200).json({
      success: true,
      message: "Dashboard chart retrieved successfully",
      data: { chart },
    });
  });

  private parseLimit(value: unknown): number {
    const parsed = Number(value ?? 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return 10;
    }

    return Math.min(Math.trunc(parsed), 50);
  }

  private parseMetric(value: unknown): DashboardChartMetric {
    if (
      typeof value === "string" &&
      CHART_METRICS.includes(value as DashboardChartMetric)
    ) {
      return value as DashboardChartMetric;
    }

    return "leads";
  }

  private parseRange(value: unknown): DashboardChartRange {
    if (
      typeof value === "string" &&
      CHART_RANGES.includes(value as DashboardChartRange)
    ) {
      return value as DashboardChartRange;
    }

    return "6m";
  }
}
