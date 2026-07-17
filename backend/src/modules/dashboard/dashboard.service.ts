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
    const [totalEmployees, totalCompanies, stats] = await Promise.all([
      context.isPlatformScope
        ? this.dashboardRepository.countAllEmployees()
        : this.dashboardRepository.countEmployees(context.companyId),
      context.isPlatformScope
        ? this.dashboardRepository.countAllCompanies()
        : Promise.resolve(1),
      context.isPlatformScope
        ? this.dashboardRepository.getPlatformStats()
        : this.dashboardRepository.getCompanyStats(context.companyId),
    ]);

    this.logger.debug("Dashboard summary loaded", {
      companyId: context.companyId,
      isPlatformScope: context.isPlatformScope,
    });

    return {
      totalEmployees,
      totalCompanies,
      totalLeads: stats.totalLeads,
      totalBookings: stats.totalBookings,
      totalRevenue: stats.totalRevenue,
      pendingFollowups: stats.pendingFollowups,
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

    const [recentUsers, recentLogins, recentLeads, recentBookings] = await Promise.all([
      this.dashboardRepository.getRecentUserActivities(context.companyId, limit),
      this.dashboardRepository.getRecentLogins(context.companyId, limit),
      this.dashboardRepository.getRecentLeadActivities(context.companyId, limit),
      this.dashboardRepository.getRecentBookingActivities(context.companyId, limit),
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

    for (const lead of recentLeads) {
      activities.push({
        id: `lead-created-${lead.uuid}`,
        type: "LEAD_CREATED",
        title: "Lead created",
        description: `${lead.customer_name} (${lead.lead_number})`,
        occurredAt: lead.created_at,
        actorName: null,
        referenceId: lead.uuid,
      });
    }

    for (const booking of recentBookings) {
      activities.push({
        id: `booking-created-${booking.uuid}`,
        type: "BOOKING_CREATED",
        title: "Booking created",
        description: `${booking.customer_name} (${booking.booking_number})`,
        occurredAt: booking.created_at,
        actorName: null,
        referenceId: booking.uuid,
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

    return this.buildMetricChart(context, metric, range);
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

  private async buildMetricChart(
    context: DashboardContext,
    metric: DashboardChartMetric,
    range: DashboardChartRange,
  ): Promise<DashboardChart> {
    const useDaily = range === "7d" || range === "30d";
    const labels = useDaily
      ? this.buildDayLabels(range === "7d" ? 7 : 30)
      : this.buildMonthLabels(RANGE_MONTHS[range]);

    const fromDate = labels[0]!;
    const toDate = labels[labels.length - 1]!;
    const trunc = useDaily ? "day" : "month";

    const datasetLabels: Record<DashboardChartMetric, string> = {
      leads: "Leads",
      bookings: "Bookings",
      revenue: "Revenue",
      employees: "Employees",
    };

    let rows;
    if (metric === "leads") {
      rows = await this.dashboardRepository.getMetricGrowth(
        context,
        "leads",
        "created_at",
        fromDate,
        `${toDate} 23:59:59`,
        trunc,
        "count",
      );
    } else if (metric === "bookings") {
      rows = await this.dashboardRepository.getMetricGrowth(
        context,
        "bookings",
        "booking_date",
        fromDate,
        toDate,
        trunc,
        "count",
      );
    } else {
      rows = await this.dashboardRepository.getMetricGrowth(
        context,
        "bookings",
        "booking_date",
        fromDate,
        toDate,
        trunc,
        "sum",
        "final_price",
      );
    }

    const valuesByPeriod = new Map(rows.map((row) => [row.period, Number(row.value)]));

    return {
      metric,
      range,
      labels,
      datasets: [
        {
          label: datasetLabels[metric],
          data: labels.map((label) => valuesByPeriod.get(label) ?? 0),
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
