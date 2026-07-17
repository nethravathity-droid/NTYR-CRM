import type { Knex } from "knex";
import { formatLocalDateKey } from "../../common/utils/local-date.js";
import type {
  CreateFollowupData,
  FollowupDetail,
  FollowupListItem,
  FollowupRecord,
  PaginatedFollowups,
  ReminderBefore,
  UpdateFollowupData,
} from "./followup.types.js";
import type { ListFollowupsQuery } from "./followup.validation.js";

const FOLLOWUP_LIST_SELECT = [
  "f.id",
  "f.uuid",
  "f.customer_name",
  "f.assigned_user_id",
  "f.followup_date",
  "f.followup_time",
  "f.followup_type",
  "f.priority",
  "f.status",
  "f.notes",
  "f.reminder_before",
  "f.next_followup_date",
  "f.created_at",
  "f.updated_at",
  "f.created_by",
  "f.updated_by",
  "l.id as lead_id",
  "l.uuid as lead_uuid",
  "l.lead_number as lead_number",
  "l.customer_name as lead_customer_name",
  "l.mobile as lead_mobile",
  "u.uuid as assignee_uuid",
  "u.employee_code as assignee_employee_code",
  "u.display_name as assignee_display_name",
] as const;

export class FollowupsRepository {
  constructor(private readonly db: Knex) {}

  async listFollowups(companyId: number, query: ListFollowupsQuery): Promise<PaginatedFollowups> {
    const baseQuery = this.buildListQuery(companyId, query);
    const countResult = await baseQuery.clone().countDistinct("f.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(FOLLOWUP_LIST_SELECT)
      .orderBy(this.resolveSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      followups: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async listFollowupsForCalendar(
    companyId: number,
    query: Pick<ListFollowupsQuery, "fromDate" | "toDate" | "assignedUserId">,
  ): Promise<FollowupListItem[]> {
    const rows = await this.buildListQuery(companyId, {
      page: 1,
      limit: 100,
      fromDate: query.fromDate,
      toDate: query.toDate,
      assignedUserId: query.assignedUserId,
      sortBy: "followup_date",
      sortOrder: "asc",
    })
      .clone()
      .select(FOLLOWUP_LIST_SELECT)
      .orderBy("f.followup_date", "asc")
      .orderBy("f.followup_time", "asc");

    return rows.map((row) => this.mapToListItem(row));
  }

  async findFollowupByUuid(companyId: number, uuid: string): Promise<FollowupDetail | null> {
    const row = await this.db("followups as f")
      .leftJoin("leads as l", "l.id", "f.lead_id")
      .leftJoin("users as u", "u.id", "f.assigned_user_id")
      .select(FOLLOWUP_LIST_SELECT)
      .where("f.company_id", companyId)
      .where("f.uuid", uuid)
      .whereNull("f.deleted_at")
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  async findFollowupRecordByUuid(companyId: number, uuid: string): Promise<FollowupRecord | null> {
    const record = await this.db<FollowupRecord>("followups")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return record ?? null;
  }

  async createFollowup(companyId: number, data: CreateFollowupData, createdBy: number): Promise<FollowupDetail> {
    const [inserted] = await this.db("followups")
      .insert({
        company_id: companyId,
        lead_id: data.leadId ?? null,
        customer_name: data.customerName,
        assigned_user_id: data.assignedUserId ?? null,
        followup_date: data.followupDate,
        followup_time: data.followupTime,
        followup_type: data.type,
        priority: data.priority ?? "MEDIUM",
        status: data.status ?? "PENDING",
        notes: data.notes ?? null,
        reminder_before: data.reminderBefore ?? 30,
        next_followup_date: data.nextFollowupDate ?? null,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning(["id", "uuid"]);

    const followup = await this.findFollowupByUuid(companyId, inserted.uuid);
    if (!followup) {
      throw new Error("Failed to retrieve created follow-up");
    }

    return followup;
  }

  async updateFollowup(companyId: number, followupId: number, data: UpdateFollowupData, updatedBy: number): Promise<FollowupDetail | null> {
    const existing = await this.db<FollowupRecord>("followups")
      .where({ id: followupId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.leadId !== undefined) {
      updatePayload.lead_id = data.leadId ?? null;
    }
    if (data.customerName !== undefined) {
      updatePayload.customer_name = data.customerName;
    }
    if (data.assignedUserId !== undefined) {
      updatePayload.assigned_user_id = data.assignedUserId ?? null;
    }
    if (data.followupDate !== undefined) {
      updatePayload.followup_date = data.followupDate;
    }
    if (data.followupTime !== undefined) {
      updatePayload.followup_time = data.followupTime;
    }
    if (data.type !== undefined) {
      updatePayload.followup_type = data.type;
    }
    if (data.priority !== undefined) {
      updatePayload.priority = data.priority;
    }
    if (data.status !== undefined) {
      updatePayload.status = data.status;
    }
    if (data.notes !== undefined) {
      updatePayload.notes = data.notes ?? null;
    }
    if (data.reminderBefore !== undefined) {
      updatePayload.reminder_before = data.reminderBefore;
    }
    if (data.nextFollowupDate !== undefined) {
      updatePayload.next_followup_date = data.nextFollowupDate ?? null;
    }

    await this.db("followups")
      .where({ id: followupId, company_id: companyId })
      .update(updatePayload);

    return this.findFollowupByUuid(companyId, existing.uuid);
  }

  async softDeleteFollowup(companyId: number, followupId: number, deletedBy: number): Promise<boolean> {
    const existing = await this.db<FollowupRecord>("followups")
      .where({ id: followupId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return false;
    }

    await this.db("followups")
      .where({ id: followupId, company_id: companyId })
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        updated_at: this.db.fn.now(),
        updated_by: deletedBy,
      });

    return true;
  }

  async markCompleted(companyId: number, followupId: number, updatedBy: number): Promise<FollowupDetail | null> {
    return this.updateFollowup(companyId, followupId, { status: "COMPLETED" }, updatedBy);
  }

  async rescheduleFollowup(companyId: number, followupId: number, input: { followupDate: string; followupTime: string; notes?: string | null }, updatedBy: number): Promise<FollowupDetail | null> {
    return this.updateFollowup(companyId, followupId, {
      followupDate: input.followupDate,
      followupTime: input.followupTime,
      notes: input.notes,
      status: "RESCHEDULED",
    }, updatedBy);
  }

  async findTodayFollowups(companyId: number, assignedUserId?: number): Promise<FollowupListItem[]> {
    const rows = await this.db("followups as f")
      .leftJoin("leads as l", "l.id", "f.lead_id")
      .leftJoin("users as u", "u.id", "f.assigned_user_id")
      .select(FOLLOWUP_LIST_SELECT)
      .where("f.company_id", companyId)
      .whereNull("f.deleted_at")
      .where("f.followup_date", formatLocalDateKey())
      .modify((qb) => {
        if (assignedUserId) qb.where("f.assigned_user_id", assignedUserId);
      })
      .orderBy("f.followup_time", "asc");

    return (rows as Record<string, unknown>[]).map((row) => this.mapToListItem(row));
  }

  async findOverdueFollowups(companyId: number, assignedUserId?: number): Promise<FollowupListItem[]> {
    const rows = await this.db("followups as f")
      .leftJoin("leads as l", "l.id", "f.lead_id")
      .leftJoin("users as u", "u.id", "f.assigned_user_id")
      .select(FOLLOWUP_LIST_SELECT)
      .where("f.company_id", companyId)
      .whereNull("f.deleted_at")
      .where("f.followup_date", "<", formatLocalDateKey())
      .whereIn("f.status", ["PENDING", "RESCHEDULED"])
      .modify((qb) => {
        if (assignedUserId) qb.where("f.assigned_user_id", assignedUserId);
      })
      .orderBy("f.followup_date", "asc");

    return (rows as Record<string, unknown>[]).map((row) => this.mapToListItem(row));
  }

  async assigneeExists(companyId: number, userId: number): Promise<boolean> {
    const user = await this.db("users")
      .where({ id: userId, company_id: companyId, status: "ACTIVE" })
      .whereNull("deleted_at")
      .first();

    return Boolean(user);
  }

  async getFormOptions(companyId: number) {
    const [assignees, leads] = await Promise.all([
      this.db("users")
        .select("id", "uuid", "employee_code as employeeCode", "display_name as displayName")
        .where({ company_id: companyId, status: "ACTIVE" })
        .whereNull("deleted_at")
        .orderBy("display_name", "asc"),
      this.db("leads")
        .select("id", "uuid", "lead_number as leadNumber", "customer_name as customerName", "mobile")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("customer_name", "asc")
        .limit(500),
    ]);

    return {
      assignees,
      leads,
      types: ["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT"],
      priorities: ["HIGH", "MEDIUM", "LOW"],
      statuses: ["PENDING", "COMPLETED", "MISSED", "RESCHEDULED"],
      reminderOptions: [5, 15, 30, 60],
    };
  }

  private buildListQuery(companyId: number, query: ListFollowupsQuery) {
    const baseQuery = this.db("followups as f")
      .leftJoin("leads as l", "l.id", "f.lead_id")
      .leftJoin("users as u", "u.id", "f.assigned_user_id")
      .where("f.company_id", companyId)
      .whereNull("f.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("f.customer_name", term)
          .orWhereILike("l.customer_name", term)
          .orWhereILike("l.lead_number", term)
          .orWhereILike("f.notes", term);
      });
    }

    if (query.status) {
      baseQuery.where("f.status", query.status);
    }

    if (query.priority) {
      baseQuery.where("f.priority", query.priority);
    }

    if (query.type) {
      baseQuery.where("f.followup_type", query.type);
    }

    if (query.assignedUserId) {
      baseQuery.where("f.assigned_user_id", query.assignedUserId);
    }

    if (query.leadId) {
      baseQuery.where("f.lead_id", query.leadId);
    }

    if (query.date) {
      baseQuery.where("f.followup_date", query.date);
    }

    if (query.fromDate) {
      baseQuery.where("f.followup_date", ">=", query.fromDate);
    }

    if (query.toDate) {
      baseQuery.where("f.followup_date", "<=", query.toDate);
    }

    if (query.upcoming) {
      baseQuery.where("f.followup_date", ">=", formatLocalDateKey());
    }

    if (query.overdue) {
      baseQuery.where("f.followup_date", "<", formatLocalDateKey());
    }

    return baseQuery;
  }

  private resolveSortColumn(sortBy: ListFollowupsQuery["sortBy"]): string {
    const columns: Record<ListFollowupsQuery["sortBy"], string> = {
      followup_date: "f.followup_date",
      followup_time: "f.followup_time",
      customer_name: "f.customer_name",
      created_at: "f.created_at",
    };

    return columns[sortBy];
  }

  private mapToListItem(row: Record<string, unknown>): FollowupListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      lead: row.lead_id
        ? {
            id: row.lead_id as number,
            uuid: row.lead_uuid as string,
            leadNumber: row.lead_number as string,
            customerName: (row.lead_customer_name as string | null) ?? (row.customer_name as string),
            mobile: (row.lead_mobile as string | null) ?? null,
          }
        : null,
      customerName: row.customer_name as string,
      assignedEmployee: row.assigned_user_id
        ? {
            id: row.assigned_user_id as number,
            uuid: row.assignee_uuid as string,
            employeeCode: row.assignee_employee_code as string,
            displayName: (row.assignee_display_name as string | null) ?? null,
          }
        : null,
      followupDate: row.followup_date as string,
      followupTime: row.followup_time as string,
      type: row.followup_type as FollowupListItem["type"],
      priority: row.priority as FollowupListItem["priority"],
      status: row.status as FollowupListItem["status"],
      notes: (row.notes as string | null) ?? null,
      reminderBefore: Number(row.reminder_before) as ReminderBefore,
      nextFollowupDate: (row.next_followup_date as string | null) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDetail(row: Record<string, unknown>): FollowupDetail {
    return {
      ...this.mapToListItem(row),
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
