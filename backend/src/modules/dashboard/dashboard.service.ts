import type { Logger } from "winston";
import { db } from "../../database/knex.js";
import { logger } from "../../config/logger.js";
import { DashboardRepository } from "./dashboard.repository.js";
import type {
  DashboardChart,
  DashboardChartMetric,
  DashboardChartRange,
  DashboardContext,
  DashboardRecentActivity,
  DashboardSummary,
} from "./dashboard.types.js";

const PLACEHOLDER_SUMMARY_FIELDS = {
  totalLeads: 0,
  totalBookings: 0,
  totalRevenue: 0,
  pendingFollowups: 0,
} as const;

const RANGE_MONTHS: Record<DashboardChartRange, number> = {
  "7d": 1,
  "30d": 1,
  "6m": 6,
  "12m": 12,
};

export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  async getSummary(context: DashboardContext): Promise<DashboardSummary> {
    const [totalEmployees, totalCompanies] = await Promise.all([
      context.isPlatformScope
        ? this.dashboardRepository.countAllEmployees()
        : this.dashboardRepository.countEmployees(context.companyId),
      context.isPlatformScope
        ? this.dashboardRepository.countAllCompanies()
        : Promise.resolve(1),
    ]);

    this.logger.debug("Dashboard summary loaded", {
      companyId: context.companyId,
      isPlatformScope: context.isPlatformScope,
    });

    return {
      totalEmployees,
      totalCompanies,
      ...PLACEHOLDER_SUMMARY_FIELDS,
    };
  }

  async getRecentActivities(
    context: DashboardContext,
    limit = 10,
  ): Promise<DashboardRecentActivity[]> {
    const activities: DashboardRecentActivity[] = [];

    if (context.isPlatformScope) {
      const companies =
        await this.dashboardRepository.getRecentCompanyActivities(limit);

      for (const company of companies) {
        const createdAt = new Date(company.created_at);
        const updatedAt = new Date(company.updated_at);
        const isNewCompany =
          updatedAt.getTime() - createdAt.getTime() < 60_000;

        activities.push({
          id: `company-${company.uuid}-${isNewCompany ? "created" : "updated"}`,
          type: isNewCompany ? "COMPANY_CREATED" : "COMPANY_UPDATED",
          title: isNewCompany ? "Company registered" : "Company updated",
          description: `${company.company_name} (${company.company_code})`,
          occurredAt: isNewCompany ? createdAt : updatedAt,
          actorName: null,
          referenceId: company.uuid,
        });
      }
    }

    const [recentUsers, recentLogins] = await Promise.all([
      this.dashboardRepository.getRecentUserActivities(context.companyId, limit),
      this.dashboardRepository.getRecentLogins(context.companyId, limit),
    ]);

    for (const user of recentUsers) {
      activities.push({
        id: `user-created-${user.uuid}`,
        type: "USER_CREATED",
        title: "Employee added",
        description: `${this.formatUserName(user)} (${user.employee_code}) joined the workspace`,
        occurredAt: user.created_at,
        actorName: this.formatUserName(user),
        referenceId: user.uuid,
      });
    }

    for (const user of recentLogins) {
      if (!user.last_login_at) {
        continue;
      }

      activities.push({
        id: `user-login-${user.uuid}-${user.last_login_at.toISOString()}`,
        type: "USER_LOGIN",
        title: "User signed in",
        description: `${this.formatUserName(user)} logged in`,
        occurredAt: user.last_login_at,
        actorName: this.formatUserName(user),
        referenceId: user.uuid,
      });
    }

    return activities
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, limit);
  }

  async getChart(
    context: DashboardContext,
    metric: DashboardChartMetric = "leads",
    range: DashboardChartRange = "6m",
  ): Promise<DashboardChart> {
    if (metric === "employees") {
      return this.buildEmployeeChart(context, range);
    }

    return this.buildPlaceholderChart(metric, range);
  }

  private async buildEmployeeChart(
    context: DashboardContext,
    range: DashboardChartRange,
  ): Promise<DashboardChart> {
    const months = RANGE_MONTHS[range];
    const labels = this.buildMonthLabels(months);
    const rows = await this.dashboardRepository.getEmployeeGrowthByMonth(
      context,
      months,
    );

    const countsByPeriod = new Map(
      rows.map((row) => [row.period, Number(row.count)]),
    );

    return {
      metric: "employees",
      range,
      labels,
      datasets: [
        {
          label: "New Employees",
          data: labels.map((label) => countsByPeriod.get(label) ?? 0),
        },
      ],
    };
  }

  private buildPlaceholderChart(
    metric: DashboardChartMetric,
    range: DashboardChartRange,
  ): DashboardChart {
    const months = RANGE_MONTHS[range];
    const labels =
      range === "7d" || range === "30d"
        ? this.buildDayLabels(range === "7d" ? 7 : 30)
        : this.buildMonthLabels(months);

    const datasetLabels: Record<DashboardChartMetric, string> = {
      leads: "Leads",
      bookings: "Bookings",
      revenue: "Revenue",
      employees: "Employees",
    };

    return {
      metric,
      range,
      labels,
      datasets: [
        {
          label: datasetLabels[metric],
          data: labels.map(() => 0),
        },
      ],
    };
  }

  private buildMonthLabels(months: number): string[] {
    const labels: string[] = [];
    const now = new Date();

    for (let index = months - 1; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      labels.push(`${year}-${month}`);
    }

    return labels;
  }

  private buildDayLabels(days: number): string[] {
    const labels: string[] = [];
    const now = new Date();

    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      labels.push(date.toISOString().slice(0, 10));
    }

    return labels;
  }

  private formatUserName(user: {
    display_name: string | null;
    first_name: string;
    last_name: string | null;
  }): string {
    return (
      user.display_name?.trim() ||
      `${user.first_name} ${user.last_name ?? ""}`.trim()
    );
  }

  buildContext(
    companyId: number,
    companyCode: string,
    permissions: string[],
  ): DashboardContext {
    return {
      companyId,
      companyCode,
      isPlatformScope: permissions.includes("companies.view"),
    };
  }
}

export const dashboardService = new DashboardService(
  new DashboardRepository(db),
  logger,
);
