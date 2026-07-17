import type { Knex } from "knex";
import type {
  BookingActivityRecord,
  CompanyActivityRecord,
  DashboardContext,
  DashboardStats,
  EmployeeGrowthRecord,
  LeadActivityRecord,
  MetricGrowthRecord,
  UserActivityRecord,
} from "./dashboard.types.js";

export class DashboardRepository {
  constructor(private readonly db: Knex) {}

  async countEmployees(companyId: number): Promise<number> {
    const result = await this.db("users")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .count("id as total")
      .first<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async countAllEmployees(): Promise<number> {
    const result = await this.db("users")
      .whereNull("deleted_at")
      .count("id as total")
      .first<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async countAllCompanies(): Promise<number> {
    const result = await this.db("companies")
      .whereNull("deleted_at")
      .count("id as total")
      .first<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async getRecentUserActivities(
    companyId: number,
    limit: number,
  ): Promise<UserActivityRecord[]> {
    return this.db("users")
      .select(
        "uuid",
        "display_name",
        "first_name",
        "last_name",
        "employee_code",
        "created_at",
        "last_login_at",
      )
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .orderBy("created_at", "desc")
      .limit(limit);
  }

  async getRecentCompanyActivities(
    limit: number,
  ): Promise<CompanyActivityRecord[]> {
    return this.db("companies")
      .select(
        "uuid",
        "company_code",
        "company_name",
        "created_at",
        "updated_at",
      )
      .whereNull("deleted_at")
      .orderBy("updated_at", "desc")
      .limit(limit);
  }

  async getEmployeeGrowthByMonth(
    context: DashboardContext,
    months: number,
  ): Promise<EmployeeGrowthRecord[]> {
    const query = this.db("users")
      .whereNull("deleted_at")
      .where(
        "created_at",
        ">=",
        this.db.raw("date_trunc('month', NOW()) - ?::interval", [
          `${months - 1} months`,
        ]),
      );

    if (!context.isPlatformScope) {
      query.where({ company_id: context.companyId });
    }

    return query
      .select(
        this.db.raw("to_char(date_trunc('month', created_at), 'YYYY-MM') as period"),
      )
      .count("id as count")
      .groupByRaw("date_trunc('month', created_at)")
      .orderByRaw("date_trunc('month', created_at) asc");
  }

  async getRecentLogins(
    companyId: number,
    limit: number,
  ): Promise<UserActivityRecord[]> {
    return this.db("users")
      .select(
        "uuid",
        "display_name",
        "first_name",
        "last_name",
        "employee_code",
        "created_at",
        "last_login_at",
      )
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .whereNotNull("last_login_at")
      .orderBy("last_login_at", "desc")
      .limit(limit);
  }

  async getCompanyStats(companyId: number): Promise<DashboardStats> {
    const today = new Date().toISOString().slice(0, 10);

    const [leads, bookings, followups] = await Promise.all([
      this.db("leads")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .count("* as total")
        .first<{ total: string }>(),
      this.db("bookings")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw("COALESCE(SUM(final_price), 0) as revenue"),
        )
        .first<{ total: string; revenue: string }>(),
      this.db("followups")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .where("status", "PENDING")
        .where("followup_date", "<=", today)
        .count("* as total")
        .first<{ total: string }>(),
    ]);

    return {
      totalLeads: Number(leads?.total ?? 0),
      totalBookings: Number(bookings?.total ?? 0),
      totalRevenue: Number(bookings?.revenue ?? 0),
      pendingFollowups: Number(followups?.total ?? 0),
    };
  }

  async getPlatformStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().slice(0, 10);

    const [leads, bookings, followups] = await Promise.all([
      this.db("leads").whereNull("deleted_at").count("* as total").first<{ total: string }>(),
      this.db("bookings")
        .whereNull("deleted_at")
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw("COALESCE(SUM(final_price), 0) as revenue"),
        )
        .first<{ total: string; revenue: string }>(),
      this.db("followups")
        .whereNull("deleted_at")
        .where("status", "PENDING")
        .where("followup_date", "<=", today)
        .count("* as total")
        .first<{ total: string }>(),
    ]);

    return {
      totalLeads: Number(leads?.total ?? 0),
      totalBookings: Number(bookings?.total ?? 0),
      totalRevenue: Number(bookings?.revenue ?? 0),
      pendingFollowups: Number(followups?.total ?? 0),
    };
  }

  async getMetricGrowth(
    context: DashboardContext,
    table: "leads" | "bookings",
    dateColumn: string,
    fromDate: string,
    toDate: string,
    trunc: "day" | "month",
    aggregate: "count" | "sum" = "count",
    valueColumn = "*",
  ): Promise<MetricGrowthRecord[]> {
    const query = this.db(table).whereNull("deleted_at").whereBetween(dateColumn, [fromDate, toDate]);

    if (!context.isPlatformScope) {
      query.where({ company_id: context.companyId });
    }

    return query
      .select(
        this.db.raw(
          `TO_CHAR(DATE_TRUNC('${trunc}', ${dateColumn}::timestamp), '${trunc === "month" ? "YYYY-MM" : "YYYY-MM-DD"}') as period`,
        ),
      )
      .select(
        this.db.raw(
          aggregate === "sum"
            ? `COALESCE(SUM(${valueColumn}), 0) as value`
            : "COUNT(*) as value",
        ),
      )
      .groupBy("period")
      .orderBy("period", "asc");
  }

  async getRecentLeadActivities(
    companyId: number,
    limit: number,
  ): Promise<LeadActivityRecord[]> {
    return this.db("leads")
      .select("uuid", "customer_name", "lead_number", "created_at")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .orderBy("created_at", "desc")
      .limit(limit);
  }

  async getRecentBookingActivities(
    companyId: number,
    limit: number,
  ): Promise<BookingActivityRecord[]> {
    return this.db("bookings")
      .select("uuid", "customer_name", "booking_number", "created_at")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .orderBy("created_at", "desc")
      .limit(limit);
  }
}
