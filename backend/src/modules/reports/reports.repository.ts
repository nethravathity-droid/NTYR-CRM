import type { Knex } from "knex";
import type {
  BookingReport,
  BreakdownItem,
  ChartData,
  DashboardKpis,
  DashboardReport,
  EmployeePerformanceItem,
  EmployeeReport,
  FollowupReport,
  LeadReport,
  PaginatedReportRows,
  PaymentReport,
  ReportFilters,
  ReportTableRow,
  SalesReport,
  VisitReport,
} from "./reports.types.js";
import type { ReportFiltersQuery } from "./reports.validation.js";

type DbRow = Record<string, unknown>;

export function resolveReportDateRange(query: ReportFiltersQuery): { fromDate: string; toDate: string } {
  const today = new Date();
  const toDate = query.toDate ?? today.toISOString().slice(0, 10);

  if (query.period === "custom" && query.fromDate) {
    return { fromDate: query.fromDate, toDate };
  }

  const from = new Date(toDate);

  switch (query.period) {
    case "daily":
      break;
    case "weekly":
      from.setDate(from.getDate() - 6);
      break;
    case "monthly":
      from.setMonth(from.getMonth() - 1);
      break;
    case "quarterly":
      from.setMonth(from.getMonth() - 3);
      break;
    case "yearly":
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      if (query.fromDate) {
        return { fromDate: query.fromDate, toDate };
      }
      from.setMonth(from.getMonth() - 1);
  }

  return { fromDate: from.toISOString().slice(0, 10), toDate };
}

export class ReportsRepository {
  constructor(private readonly db: Knex) {}

  toFilters(query: ReportFiltersQuery): ReportFilters {
    const range = resolveReportDateRange(query);
    return { ...query, ...range };
  }

  async getDashboardKpis(companyId: number, filters: ReportFilters): Promise<DashboardKpis> {
    const today = new Date().toISOString().slice(0, 10);

    const [leads, followupsDue, visits, bookings, payments] = await Promise.all([
      this.db("leads")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereBetween("created_at", [filters.fromDate, `${filters.toDate} 23:59:59`])
        .modify((qb) => this.applyLeadFilters(qb, filters))
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw("COUNT(*) FILTER (WHERE status NOT IN ('LOST', 'BOOKED')) as active"),
          this.db.raw("COUNT(*) FILTER (WHERE status = 'BOOKED') as converted"),
          this.db.raw("COUNT(*) FILTER (WHERE status = 'LOST') as lost"),
        )
        .first(),
      this.db("followups")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .where("status", "PENDING")
        .where("followup_date", "<=", today)
        .count("* as count")
        .first<{ count: string }>(),
      this.db("site_visits")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereBetween("visit_date", [filters.fromDate, filters.toDate])
        .count("* as count")
        .first<{ count: string }>(),
      this.db("bookings")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereBetween("booking_date", [filters.fromDate, filters.toDate])
        .modify((qb) => this.applyBookingFilters(qb, filters))
        .select(
          this.db.raw("COUNT(*) as count"),
          this.db.raw("COALESCE(SUM(final_price), 0) as revenue"),
        )
        .first(),
      this.db("payments")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereBetween("due_date", [filters.fromDate, filters.toDate])
        .modify((qb) => this.applyPaymentFilters(qb, filters))
        .select(
          this.db.raw("COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as collection"),
          this.db.raw("COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PARTIAL') THEN due_amount ELSE 0 END), 0) as outstanding"),
        )
        .first(),
    ]);

    return {
      totalLeads: Number(leads?.total ?? 0),
      activeLeads: Number(leads?.active ?? 0),
      convertedLeads: Number(leads?.converted ?? 0),
      lostLeads: Number(leads?.lost ?? 0),
      followupsDue: Number(followupsDue?.count ?? 0),
      siteVisits: Number(visits?.count ?? 0),
      bookings: Number(bookings?.count ?? 0),
      revenue: Number(bookings?.revenue ?? 0),
      collection: Number(payments?.collection ?? 0),
      outstanding: Number(payments?.outstanding ?? 0),
    };
  }

  async getLeadSourceBreakdown(companyId: number, filters: ReportFilters): Promise<BreakdownItem[]> {
    const rows = await this.db("leads")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("created_at", [filters.fromDate, `${filters.toDate} 23:59:59`])
      .modify((qb) => this.applyLeadFilters(qb, filters))
      .select(this.db.raw("COALESCE(NULLIF(TRIM(lead_source), ''), 'Unknown') as label"))
      .count("* as value")
      .groupBy("label")
      .orderBy("value", "desc");

    return rows.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) }));
  }

  async getLeadStatusFunnel(companyId: number, filters: ReportFilters): Promise<BreakdownItem[]> {
    const rows = await this.db("leads")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("created_at", [filters.fromDate, `${filters.toDate} 23:59:59`])
      .modify((qb) => this.applyLeadFilters(qb, filters))
      .select("status as label")
      .count("* as value")
      .groupBy("status")
      .orderBy("value", "desc");

    return rows.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) }));
  }

  async getTimeSeries(
    companyId: number,
    table: string,
    dateColumn: string,
    filters: ReportFilters,
    extraWhere?: (qb: Knex.QueryBuilder) => void,
    valueColumn = "*",
    aggregate: "count" | "sum" = "count",
  ): Promise<ChartData> {
    const labels = this.buildDateLabels(filters.fromDate, filters.toDate);
    const trunc = labels.length > 31 ? "month" : "day";

    const query = this.db(table)
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween(dateColumn, [filters.fromDate, filters.toDate]);

    if (extraWhere) extraWhere(query);

    const rows = await query
      .select(this.db.raw(`TO_CHAR(DATE_TRUNC('${trunc}', ${dateColumn}::timestamp), '${trunc === "month" ? "YYYY-MM" : "YYYY-MM-DD"}') as period`))
      .select(this.db.raw(aggregate === "sum" ? `COALESCE(SUM(${valueColumn}), 0) as value` : "COUNT(*) as value"))
      .groupBy("period")
      .orderBy("period", "asc");

    const map = new Map(rows.map((row) => [row.period as string, Number(row.value)]));
    return {
      labels,
      datasets: [{ label: table, data: labels.map((label) => map.get(label) ?? 0) }],
    };
  }

  async getEmployeePerformance(companyId: number, filters: ReportFilters): Promise<EmployeePerformanceItem[]> {
    const users = await this.db("users")
      .where({ company_id: companyId, status: "ACTIVE" })
      .whereNull("deleted_at")
      .select("id", "employee_code as employeeCode", "display_name as displayName");

    const performance = await Promise.all(
      users.map(async (user) => {
        const [leads, followups, visits, bookings, payments] = await Promise.all([
          this.db("leads").where({ company_id: companyId, assigned_user_id: user.id }).whereNull("deleted_at")
            .whereBetween("created_at", [filters.fromDate, `${filters.toDate} 23:59:59`]).count("* as c").first(),
          this.db("followups").where({ company_id: companyId, assigned_user_id: user.id, status: "COMPLETED" }).whereNull("deleted_at")
            .whereBetween("followup_date", [filters.fromDate, filters.toDate]).count("* as c").first(),
          this.db("site_visits").where({ company_id: companyId, assigned_user_id: user.id, status: "COMPLETED" }).whereNull("deleted_at")
            .whereBetween("visit_date", [filters.fromDate, filters.toDate]).count("* as c").first(),
          this.db("bookings").where({ company_id: companyId, sales_executive_user_id: user.id }).whereNull("deleted_at")
            .whereIn("status", ["APPROVED", "COMPLETED"]).whereBetween("booking_date", [filters.fromDate, filters.toDate]).count("* as c").first(),
          this.db("payments").where({ company_id: companyId, status: "PAID" }).whereNull("deleted_at")
            .whereBetween("payment_date", [filters.fromDate, filters.toDate]).sum("amount as total").first(),
        ]);

        return {
          userId: user.id as number,
          employeeCode: user.employeeCode as string,
          displayName: (user.displayName as string | null) ?? null,
          leadsAssigned: Number(leads?.c ?? 0),
          followupsCompleted: Number(followups?.c ?? 0),
          visitsCompleted: Number(visits?.c ?? 0),
          bookingsClosed: Number(bookings?.c ?? 0),
          revenueCollected: Number(payments?.total ?? 0),
        };
      }),
    );

    return performance.sort((a, b) => b.bookingsClosed - a.bookingsClosed || b.leadsAssigned - a.leadsAssigned);
  }

  async getDashboardReport(companyId: number, filters: ReportFilters): Promise<DashboardReport> {
    const [kpis, leadSourceChart, leadStatusFunnel, salesTrend, revenueTrend, bookingTrend, paymentCollection] =
      await Promise.all([
        this.getDashboardKpis(companyId, filters),
        this.getLeadSourceBreakdown(companyId, filters),
        this.getLeadStatusFunnel(companyId, filters),
        this.getTimeSeries(companyId, "bookings", "booking_date", filters, (qb) => this.applyBookingFilters(qb, filters)),
        this.getTimeSeries(companyId, "payments", "payment_date", filters, (qb) => {
          qb.where("status", "PAID");
          this.applyPaymentFilters(qb, filters);
        }, "amount", "sum"),
        this.getTimeSeries(companyId, "bookings", "booking_date", filters, (qb) => this.applyBookingFilters(qb, filters)),
        this.getTimeSeries(companyId, "payments", "payment_date", filters, (qb) => {
          qb.where("status", "PAID");
          this.applyPaymentFilters(qb, filters);
        }, "amount", "sum"),
      ]);

    salesTrend.datasets[0]!.label = "Bookings";
    revenueTrend.datasets[0]!.label = "Revenue";
    bookingTrend.datasets[0]!.label = "Bookings";
    paymentCollection.datasets[0]!.label = "Collection";

    return { kpis, leadSourceChart, leadStatusFunnel, salesTrend, revenueTrend, bookingTrend, paymentCollection };
  }

  async getLeadReport(companyId: number, filters: ReportFilters): Promise<LeadReport> {
    const kpis = await this.getDashboardKpis(companyId, filters);
    const total = kpis.totalLeads;
    const [leadSourceChart, leadStatusFunnel, trend, rows] = await Promise.all([
      this.getLeadSourceBreakdown(companyId, filters),
      this.getLeadStatusFunnel(companyId, filters),
      this.getTimeSeries(companyId, "leads", "created_at", filters, (qb) => this.applyLeadFilters(qb, filters)),
      this.getLeadRows(companyId, filters),
    ]);

    trend.datasets[0]!.label = "Leads";

    return {
      summary: {
        total,
        active: kpis.activeLeads,
        converted: kpis.convertedLeads,
        lost: kpis.lostLeads,
        conversionRate: total > 0 ? Number(((kpis.convertedLeads / total) * 100).toFixed(1)) : 0,
      },
      leadSourceChart,
      leadStatusFunnel,
      trend,
      rows,
    };
  }

  async getSalesReport(companyId: number, filters: ReportFilters): Promise<SalesReport> {
    const summaryRow = await this.db("bookings")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("booking_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyBookingFilters(qb, filters))
      .select(
        this.db.raw("COUNT(*) as total"),
        this.db.raw("COUNT(*) FILTER (WHERE status IN ('APPROVED', 'COMPLETED')) as approved"),
        this.db.raw("COALESCE(SUM(final_price), 0) as total_value"),
        this.db.raw("COALESCE(AVG(final_price), 0) as average_value"),
      )
      .first();

    const byProject = await this.db("bookings as b")
      .join("projects as p", "p.id", "b.project_id")
      .where("b.company_id", companyId)
      .whereNull("b.deleted_at")
      .whereBetween("b.booking_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyBookingFilters(qb, filters, "b"))
      .select("p.project_name as label")
      .count("* as value")
      .groupBy("p.project_name")
      .orderBy("value", "desc");

    const trend = await this.getTimeSeries(companyId, "bookings", "booking_date", filters, (qb) => this.applyBookingFilters(qb, filters));
    trend.datasets[0]!.label = "Sales";

    return {
      summary: {
        totalBookings: Number(summaryRow?.total ?? 0),
        approvedBookings: Number(summaryRow?.approved ?? 0),
        totalValue: Number(summaryRow?.total_value ?? 0),
        averageValue: Number(summaryRow?.average_value ?? 0),
      },
      trend,
      byProject: byProject.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) })),
      rows: await this.getBookingRows(companyId, filters),
    };
  }

  async getEmployeeReport(companyId: number, filters: ReportFilters): Promise<EmployeeReport> {
    const performance = await this.getEmployeePerformance(companyId, filters);
    return {
      performance,
      chart: {
        labels: performance.map((item) => item.displayName ?? item.employeeCode),
        datasets: [
          { label: "Leads", data: performance.map((item) => item.leadsAssigned) },
          { label: "Bookings", data: performance.map((item) => item.bookingsClosed) },
        ],
      },
    };
  }

  async getFollowupReport(companyId: number, filters: ReportFilters): Promise<FollowupReport> {
    const summary = await this.db("followups")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("followup_date", [filters.fromDate, filters.toDate])
      .select(
        this.db.raw("COUNT(*) as total"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'PENDING') as pending"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'MISSED') as missed"),
      )
      .first();

    const byType = await this.db("followups")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("followup_date", [filters.fromDate, filters.toDate])
      .select("followup_type as label")
      .count("* as value")
      .groupBy("followup_type");

    const trend = await this.getTimeSeries(companyId, "followups", "followup_date", filters);
    trend.datasets[0]!.label = "Follow-ups";

    return {
      summary: {
        total: Number(summary?.total ?? 0),
        pending: Number(summary?.pending ?? 0),
        completed: Number(summary?.completed ?? 0),
        missed: Number(summary?.missed ?? 0),
      },
      byType: byType.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) })),
      trend,
      rows: await this.getFollowupRows(companyId, filters),
    };
  }

  async getVisitReport(companyId: number, filters: ReportFilters): Promise<VisitReport> {
    const summary = await this.db("site_visits")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("visit_date", [filters.fromDate, filters.toDate])
      .select(
        this.db.raw("COUNT(*) as total"),
        this.db.raw("COUNT(*) FILTER (WHERE status IN ('SCHEDULED', 'CONFIRMED')) as scheduled"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'NO_SHOW') as no_show"),
      )
      .first();

    const byStatus = await this.db("site_visits")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("visit_date", [filters.fromDate, filters.toDate])
      .select("status as label")
      .count("* as value")
      .groupBy("status");

    const trend = await this.getTimeSeries(companyId, "site_visits", "visit_date", filters);
    trend.datasets[0]!.label = "Visits";

    return {
      summary: {
        total: Number(summary?.total ?? 0),
        scheduled: Number(summary?.scheduled ?? 0),
        completed: Number(summary?.completed ?? 0),
        cancelled: Number(summary?.cancelled ?? 0),
        noShow: Number(summary?.no_show ?? 0),
      },
      byStatus: byStatus.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) })),
      trend,
      rows: await this.getVisitRows(companyId, filters),
    };
  }

  async getBookingReport(companyId: number, filters: ReportFilters): Promise<BookingReport> {
    const summary = await this.db("bookings")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("booking_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyBookingFilters(qb, filters))
      .select(
        this.db.raw("COUNT(*) as total"),
        this.db.raw("COUNT(*) FILTER (WHERE status IN ('APPROVED', 'COMPLETED')) as approved"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL') as pending"),
        this.db.raw("COALESCE(SUM(final_price), 0) as total_value"),
      )
      .first();

    const byStatus = await this.db("bookings")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("booking_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyBookingFilters(qb, filters))
      .select("status as label")
      .count("* as value")
      .groupBy("status");

    const trend = await this.getTimeSeries(companyId, "bookings", "booking_date", filters, (qb) => this.applyBookingFilters(qb, filters));
    trend.datasets[0]!.label = "Bookings";

    return {
      summary: {
        total: Number(summary?.total ?? 0),
        approved: Number(summary?.approved ?? 0),
        pendingApproval: Number(summary?.pending ?? 0),
        totalValue: Number(summary?.total_value ?? 0),
      },
      byStatus: byStatus.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) })),
      trend,
      rows: await this.getBookingRows(companyId, filters),
    };
  }

  async getPaymentReport(companyId: number, filters: ReportFilters): Promise<PaymentReport> {
    const today = new Date().toISOString().slice(0, 10);
    const summary = await this.db("payments")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("due_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyPaymentFilters(qb, filters))
      .select(
        this.db.raw("COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as collected"),
        this.db.raw("COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PARTIAL') THEN due_amount ELSE 0 END), 0) as outstanding"),
        this.db.raw(`COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PARTIAL', 'FAILED') AND due_date < ? THEN due_amount ELSE 0 END), 0) as overdue`, [today]),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'PAID') as paid_count"),
        this.db.raw("COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count"),
      )
      .first();

    const [byType, byMode] = await Promise.all([
      this.db("payments").where({ company_id: companyId }).whereNull("deleted_at")
        .whereBetween("due_date", [filters.fromDate, filters.toDate])
        .modify((qb) => this.applyPaymentFilters(qb, filters))
        .select("payment_type as label").count("* as value").groupBy("payment_type"),
      this.db("payments").where({ company_id: companyId }).whereNull("deleted_at")
        .whereBetween("due_date", [filters.fromDate, filters.toDate])
        .modify((qb) => this.applyPaymentFilters(qb, filters))
        .whereNotNull("payment_mode")
        .select("payment_mode as label").count("* as value").groupBy("payment_mode"),
    ]);

    const trend = await this.getTimeSeries(companyId, "payments", "payment_date", filters, (qb) => {
      qb.where("status", "PAID");
      this.applyPaymentFilters(qb, filters);
    }, "amount", "sum");
    trend.datasets[0]!.label = "Collection";

    return {
      summary: {
        totalCollected: Number(summary?.collected ?? 0),
        totalOutstanding: Number(summary?.outstanding ?? 0),
        totalOverdue: Number(summary?.overdue ?? 0),
        paidCount: Number(summary?.paid_count ?? 0),
        pendingCount: Number(summary?.pending_count ?? 0),
      },
      byType: byType.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) })),
      byMode: byMode.map((row: DbRow) => ({ label: row.label as string, value: Number(row.value) })),
      trend,
      rows: await this.getPaymentRows(companyId, filters),
    };
  }

  async getExportRows(companyId: number, reportType: string, filters: ReportFilters): Promise<ReportTableRow[]> {
    switch (reportType) {
      case "leads":
        return (await this.getLeadRows(companyId, { ...filters, page: 1, limit: 10000 })).rows;
      case "sales":
      case "bookings":
        return (await this.getBookingRows(companyId, { ...filters, page: 1, limit: 10000 })).rows;
      case "employees":
        return (await this.getEmployeePerformance(companyId, filters)).map((item) => ({
          employeeCode: item.employeeCode,
          displayName: item.displayName,
          leadsAssigned: item.leadsAssigned,
          followupsCompleted: item.followupsCompleted,
          visitsCompleted: item.visitsCompleted,
          bookingsClosed: item.bookingsClosed,
          revenueCollected: item.revenueCollected,
        }));
      case "followups":
        return (await this.getFollowupRows(companyId, { ...filters, page: 1, limit: 10000 })).rows;
      case "visits":
        return (await this.getVisitRows(companyId, { ...filters, page: 1, limit: 10000 })).rows;
      case "payments":
        return (await this.getPaymentRows(companyId, { ...filters, page: 1, limit: 10000 })).rows;
      case "dashboard": {
        const kpis = await this.getDashboardKpis(companyId, filters);
        return Object.entries(kpis).map(([metric, value]) => ({ metric, value }));
      }
      default:
        return [];
    }
  }

  private async getLeadRows(companyId: number, filters: ReportFilters): Promise<PaginatedReportRows> {
    const base = this.db("leads")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("created_at", [filters.fromDate, `${filters.toDate} 23:59:59`])
      .modify((qb) => this.applyLeadFilters(qb, filters));

    return this.paginateRows(base, filters, ["lead_number", "customer_name", "mobile", "lead_source", "status", "created_at"]);
  }

  private async getFollowupRows(companyId: number, filters: ReportFilters): Promise<PaginatedReportRows> {
    const base = this.db("followups")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("followup_date", [filters.fromDate, filters.toDate]);

    return this.paginateRows(base, filters, ["customer_name", "followup_type", "followup_date", "status", "priority"]);
  }

  private async getVisitRows(companyId: number, filters: ReportFilters): Promise<PaginatedReportRows> {
    const base = this.db("site_visits")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("visit_date", [filters.fromDate, filters.toDate]);

    return this.paginateRows(base, filters, ["visit_number", "customer_name", "visit_date", "status", "project_id"]);
  }

  private async getBookingRows(companyId: number, filters: ReportFilters): Promise<PaginatedReportRows> {
    const base = this.db("bookings")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("booking_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyBookingFilters(qb, filters));

    return this.paginateRows(base, filters, ["booking_number", "customer_name", "booking_date", "status", "final_price"]);
  }

  private async getPaymentRows(companyId: number, filters: ReportFilters): Promise<PaginatedReportRows> {
    const base = this.db("payments")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereBetween("due_date", [filters.fromDate, filters.toDate])
      .modify((qb) => this.applyPaymentFilters(qb, filters));

    return this.paginateRows(base, filters, ["payment_number", "customer_name", "payment_type", "amount", "due_amount", "status", "due_date"]);
  }

  private async paginateRows(
    baseQuery: Knex.QueryBuilder,
    filters: ReportFilters,
    columns: string[],
  ): Promise<PaginatedReportRows> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const countResult = await baseQuery.clone().count("* as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);

    const rows = await baseQuery.clone().select(columns).orderBy(columns[0]!, "desc").limit(limit).offset(offset);

    return {
      rows: rows.map((row: DbRow) => {
        const mapped: ReportTableRow = {};
        for (const column of columns) {
          mapped[column] = row[column] as string | number | null;
        }
        return mapped;
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    };
  }

  private applyLeadFilters(qb: Knex.QueryBuilder, filters: ReportFilters, alias = "") {
    const prefix = alias ? `${alias}.` : "";
    if (filters.assignedUserId) qb.where(`${prefix}assigned_user_id`, filters.assignedUserId);
    if (filters.leadSource) qb.whereILike(`${prefix}lead_source`, filters.leadSource);
    if (filters.search) {
      const term = `%${filters.search}%`;
      qb.where(function search() {
        this.whereILike(`${prefix}customer_name`, term).orWhereILike(`${prefix}lead_number`, term);
      });
    }
  }

  private applyBookingFilters(qb: Knex.QueryBuilder, filters: ReportFilters, alias = "") {
    const prefix = alias ? `${alias}.` : "";
    if (filters.projectId) qb.where(`${prefix}project_id`, filters.projectId);
    if (filters.branchId) qb.where(`${prefix}branch_id`, filters.branchId);
    if (filters.assignedUserId) qb.where(`${prefix}sales_executive_user_id`, filters.assignedUserId);
  }

  private applyPaymentFilters(qb: Knex.QueryBuilder, filters: ReportFilters, alias = "") {
    const prefix = alias ? `${alias}.` : "";
    if (filters.projectId) qb.where(`${prefix}project_id`, filters.projectId);
  }

  private buildDateLabels(fromDate: string, toDate: string): string[] {
    const labels: string[] = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daySpan = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daySpan > 62) {
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor <= end) {
        labels.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return labels;
    }

    const cursor = new Date(fromDate);
    while (cursor <= end) {
      labels.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return labels;
  }
}
