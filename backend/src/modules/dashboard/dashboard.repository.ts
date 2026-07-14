import type { Knex } from "knex";
import type {
  CompanyActivityRecord,
  DashboardContext,
  EmployeeGrowthRecord,
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
}
