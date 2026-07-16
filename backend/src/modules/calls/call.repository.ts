import type { Knex } from "knex";
import type {
  CallAuditEntry,
  CallDashboardSummary,
  CallDetail,
  CallListItem,
  CallRecord,
  CallTimelineEntry,
  CreateCallData,
  PaginatedCalls,
  UpdateCallData,
} from "./call.types.js";
import type { CallSummaryQuery, ListCallsQuery } from "./call.validation.js";

type DbRow = Record<string, unknown>;

const CALL_LIST_SELECT = [
  "c.id",
  "c.uuid",
  "c.call_number",
  "c.customer_name",
  "c.mobile",
  "c.direction",
  "c.call_status",
  "c.call_date",
  "c.call_time",
  "c.duration_seconds",
  "c.notes",
  "c.created_at",
  "c.updated_at",
  "c.created_by",
  "c.updated_by",
  "l.id as lead_id",
  "l.uuid as lead_uuid",
  "l.lead_number",
  "l.customer_name as lead_customer_name",
  "l.mobile as lead_mobile",
  "a.id as assignee_id",
  "a.uuid as assignee_uuid",
  "a.employee_code as assignee_employee_code",
  "a.display_name as assignee_display_name",
  "f.id as followup_id",
  "f.uuid as followup_uuid",
  "f.followup_date",
  "f.followup_time",
  "f.status as followup_status",
] as const;

export class CallsRepository {
  constructor(private readonly db: Knex) {}

  async listCalls(companyId: number, query: ListCallsQuery): Promise<PaginatedCalls> {
    const baseQuery = this.buildListQuery(companyId, query);
    const countResult = await baseQuery.clone().countDistinct("c.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(CALL_LIST_SELECT)
      .orderBy(this.resolveSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      calls: rows.map((row: DbRow) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async getDashboardSummary(companyId: number, query: CallSummaryQuery): Promise<CallDashboardSummary> {
    const base = this.db("calls as c")
      .where("c.company_id", companyId)
      .whereNull("c.deleted_at");

    if (query.fromDate) base.where("c.call_date", ">=", query.fromDate);
    if (query.toDate) base.where("c.call_date", "<=", query.toDate);

    const summary = await base.clone().select(
      this.db.raw("COUNT(*) as total"),
      this.db.raw("COUNT(*) FILTER (WHERE direction = 'INCOMING') as incoming"),
      this.db.raw("COUNT(*) FILTER (WHERE direction = 'OUTGOING') as outgoing"),
      this.db.raw("COUNT(*) FILTER (WHERE direction = 'MISSED') as missed"),
      this.db.raw("COUNT(*) FILTER (WHERE call_status = 'ANSWERED') as answered"),
      this.db.raw("COALESCE(SUM(duration_seconds), 0) as total_duration"),
      this.db.raw("COALESCE(AVG(NULLIF(duration_seconds, 0)), 0) as avg_duration"),
    ).first();

    const recentRows = await base.clone()
      .leftJoin("leads as l", "l.id", "c.lead_id")
      .leftJoin("users as a", "a.id", "c.assigned_user_id")
      .leftJoin("followups as f", "f.id", "c.followup_id")
      .select(CALL_LIST_SELECT)
      .orderBy("c.call_date", "desc")
      .orderBy("c.call_time", "desc")
      .limit(5);

    const totalCalls = Number(summary?.total ?? 0);

    return {
      totalCalls,
      incomingCalls: Number(summary?.incoming ?? 0),
      outgoingCalls: Number(summary?.outgoing ?? 0),
      missedCalls: Number(summary?.missed ?? 0),
      answeredCalls: Number(summary?.answered ?? 0),
      totalDurationSeconds: Number(summary?.total_duration ?? 0),
      averageDurationSeconds: Math.round(Number(summary?.avg_duration ?? 0)),
      recentCalls: recentRows.map((row: DbRow) => this.mapToListItem(row)),
    };
  }

  async findCallByUuid(companyId: number, uuid: string): Promise<CallDetail | null> {
    const row = await this.buildListQuery(companyId, { page: 1, limit: 1, sortBy: "call_date", sortOrder: "desc" })
      .clone()
      .where("c.uuid", uuid)
      .select(CALL_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row as DbRow) : null;
  }

  async findCallRecordByUuid(companyId: number, uuid: string): Promise<CallRecord | null> {
    const record = await this.db<CallRecord>("calls")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return record ?? null;
  }

  async createCall(companyId: number, data: CreateCallData, createdBy: number): Promise<CallDetail> {
    return this.db.transaction(async (trx) => {
      const callNumber = await this.generateCallNumber(companyId, trx);
      let followupId: number | null = null;

      if (data.autoCreateFollowup && data.nextFollowupDate && data.nextFollowupTime) {
        const [followup] = await trx("followups")
          .insert({
            company_id: companyId,
            lead_id: data.leadId ?? null,
            customer_name: data.customerName,
            assigned_user_id: data.assignedUserId ?? createdBy,
            followup_date: data.nextFollowupDate,
            followup_time: data.nextFollowupTime,
            followup_type: "CALL",
            priority: "MEDIUM",
            status: "PENDING",
            notes: data.notes ? `Auto-created from call ${callNumber}: ${data.notes}` : `Auto-created from call ${callNumber}`,
            created_by: createdBy,
            updated_by: createdBy,
          })
          .returning(["id"]);

        followupId = followup.id;
      }

      const [inserted] = await trx("calls")
        .insert({
          company_id: companyId,
          call_number: callNumber,
          lead_id: data.leadId ?? null,
          customer_name: data.customerName,
          mobile: data.mobile,
          direction: data.direction,
          call_status: data.callStatus,
          call_date: data.callDate,
          call_time: data.callTime,
          duration_seconds: data.durationSeconds ?? 0,
          assigned_user_id: data.assignedUserId ?? null,
          notes: data.notes ?? null,
          followup_id: followupId,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning(["id", "uuid"]);

      await this.insertAuditLog(trx, companyId, inserted.id, "CREATED", { callNumber, followupId }, createdBy);

      const call = await this.findCallByUuidInTrx(trx, companyId, inserted.uuid);
      if (!call) {
        throw new Error("Failed to retrieve created call");
      }

      return call;
    });
  }

  async updateCall(companyId: number, callId: number, data: UpdateCallData, updatedBy: number): Promise<CallDetail | null> {
    const existing = await this.db<CallRecord>("calls")
      .where({ id: callId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.leadId !== undefined) updatePayload.lead_id = data.leadId;
    if (data.customerName !== undefined) updatePayload.customer_name = data.customerName;
    if (data.mobile !== undefined) updatePayload.mobile = data.mobile;
    if (data.direction !== undefined) updatePayload.direction = data.direction;
    if (data.callStatus !== undefined) updatePayload.call_status = data.callStatus;
    if (data.callDate !== undefined) updatePayload.call_date = data.callDate;
    if (data.callTime !== undefined) updatePayload.call_time = data.callTime;
    if (data.durationSeconds !== undefined) updatePayload.duration_seconds = data.durationSeconds;
    if (data.assignedUserId !== undefined) updatePayload.assigned_user_id = data.assignedUserId;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    await this.db.transaction(async (trx) => {
      await trx("calls").where({ id: callId, company_id: companyId }).update(updatePayload);
      await this.insertAuditLog(trx, companyId, callId, "UPDATED", data, updatedBy);
    });

    return this.findCallByUuid(companyId, existing.uuid);
  }

  async softDeleteCall(companyId: number, callId: number, deletedBy: number): Promise<boolean> {
    const existing = await this.db<CallRecord>("calls")
      .where({ id: callId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return false;
    }

    await this.db.transaction(async (trx) => {
      await trx("calls")
        .where({ id: callId, company_id: companyId })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: deletedBy,
          updated_at: trx.fn.now(),
          updated_by: deletedBy,
        });

      await this.insertAuditLog(trx, companyId, callId, "DELETED", { callNumber: existing.call_number }, deletedBy);
    });

    return true;
  }

  async getAuditTrail(companyId: number, callId: number): Promise<CallAuditEntry[]> {
    const rows = await this.db("call_audit_logs as al")
      .leftJoin("users as u", "u.id", "al.performed_by")
      .where({ "al.company_id": companyId, "al.call_id": callId })
      .select(
        "al.id",
        "al.uuid",
        "al.action",
        "al.changes",
        "al.performed_by",
        "al.created_at",
        "u.display_name as performer_name",
      )
      .orderBy("al.created_at", "desc");

    return rows.map((row: DbRow) => ({
      id: row.id as number,
      uuid: row.uuid as string,
      action: row.action as string,
      changes: (row.changes as Record<string, unknown> | null) ?? null,
      performedBy: (row.performed_by as number | null) ?? null,
      performerName: (row.performer_name as string | null) ?? null,
      createdAt: row.created_at as string,
    }));
  }

  async getCallTimeline(companyId: number, call: CallRecord): Promise<CallTimelineEntry[]> {
    const auditEntries = await this.getAuditTrail(companyId, call.id);
    const timeline: CallTimelineEntry[] = auditEntries.map((entry) => ({
      id: entry.id,
      uuid: entry.uuid,
      type: "AUDIT",
      title: entry.action,
      description: entry.changes ? JSON.stringify(entry.changes) : null,
      callStatus: null,
      direction: null,
      durationSeconds: null,
      performedBy: entry.performerName,
      createdAt: entry.createdAt,
    }));

    if (call.lead_id) {
      const leadCalls = await this.db("calls as c")
        .leftJoin("users as u", "u.id", "c.created_by")
        .where("c.company_id", companyId)
        .where("c.lead_id", call.lead_id)
        .whereNull("c.deleted_at")
        .whereNot("c.id", call.id)
        .select(
          "c.id",
          "c.uuid",
          "c.call_number",
          "c.direction",
          "c.call_status",
          "c.duration_seconds",
          "c.call_date",
          "c.call_time",
          "c.created_at",
          "u.display_name as performer_name",
        )
        .orderBy("c.call_date", "desc")
        .orderBy("c.call_time", "desc")
        .limit(20);

      for (const row of leadCalls as DbRow[]) {
        timeline.push({
          id: row.id as number,
          uuid: row.uuid as string,
          type: "CALL",
          title: `Call ${row.call_number as string}`,
          description: `${row.direction as string} · ${row.call_status as string}`,
          callStatus: row.call_status as CallTimelineEntry["callStatus"],
          direction: row.direction as CallTimelineEntry["direction"],
          durationSeconds: row.duration_seconds as number,
          performedBy: (row.performer_name as string | null) ?? null,
          createdAt: `${row.call_date as string}T${row.call_time as string}`,
        });
      }
    }

    return timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      directions: ["INCOMING", "OUTGOING", "MISSED"],
      callStatuses: ["ANSWERED", "BUSY", "NO_ANSWER", "SWITCHED_OFF", "WRONG_NUMBER"],
    };
  }

  private buildListQuery(companyId: number, query: Partial<ListCallsQuery>) {
    const baseQuery = this.db("calls as c")
      .leftJoin("leads as l", "l.id", "c.lead_id")
      .leftJoin("users as a", "a.id", "c.assigned_user_id")
      .leftJoin("followups as f", "f.id", "c.followup_id")
      .where("c.company_id", companyId)
      .whereNull("c.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("c.customer_name", term)
          .orWhereILike("c.mobile", term)
          .orWhereILike("c.call_number", term)
          .orWhereILike("l.lead_number", term);
      });
    }

    if (query.direction) baseQuery.where("c.direction", query.direction);
    if (query.callStatus) baseQuery.where("c.call_status", query.callStatus);
    if (query.assignedUserId) baseQuery.where("c.assigned_user_id", query.assignedUserId);
    if (query.leadId) baseQuery.where("c.lead_id", query.leadId);
    if (query.fromDate) baseQuery.where("c.call_date", ">=", query.fromDate);
    if (query.toDate) baseQuery.where("c.call_date", "<=", query.toDate);

    return baseQuery;
  }

  private async findCallByUuidInTrx(trx: Knex.Transaction, companyId: number, uuid: string): Promise<CallDetail | null> {
    const row = await trx("calls as c")
      .leftJoin("leads as l", "l.id", "c.lead_id")
      .leftJoin("users as a", "a.id", "c.assigned_user_id")
      .leftJoin("followups as f", "f.id", "c.followup_id")
      .where("c.company_id", companyId)
      .where("c.uuid", uuid)
      .whereNull("c.deleted_at")
      .select(CALL_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row as DbRow) : null;
  }

  private async generateCallNumber(companyId: number, trx: Knex.Transaction): Promise<string> {
    const last = await trx("calls")
      .where({ company_id: companyId })
      .orderBy("id", "desc")
      .select("call_number")
      .forUpdate()
      .first<{ call_number: string }>();

    let next = 1;
    if (last?.call_number) {
      const match = last.call_number.match(/(\d+)$/);
      if (match?.[1]) {
        next = Number.parseInt(match[1], 10) + 1;
      }
    }

    return `CL-${String(next).padStart(5, "0")}`;
  }

  private async insertAuditLog(
    trx: Knex | Knex.Transaction,
    companyId: number,
    callId: number,
    action: string,
    changes: Record<string, unknown>,
    performedBy: number,
  ): Promise<void> {
    await trx("call_audit_logs").insert({
      company_id: companyId,
      call_id: callId,
      action,
      changes: JSON.stringify(changes),
      performed_by: performedBy,
    });
  }

  private resolveSortColumn(sortBy: ListCallsQuery["sortBy"]): string {
    const map: Record<ListCallsQuery["sortBy"], string> = {
      call_date: "c.call_date",
      call_time: "c.call_time",
      customer_name: "c.customer_name",
      created_at: "c.created_at",
      duration_seconds: "c.duration_seconds",
    };

    return map[sortBy];
  }

  private mapToListItem(row: DbRow): CallListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      callNumber: row.call_number as string,
      lead: row.lead_id
        ? {
            id: row.lead_id as number,
            uuid: row.lead_uuid as string,
            leadNumber: row.lead_number as string,
            customerName: row.lead_customer_name as string,
            mobile: (row.lead_mobile as string | null) ?? null,
          }
        : null,
      customerName: row.customer_name as string,
      mobile: row.mobile as string,
      direction: row.direction as CallListItem["direction"],
      callStatus: row.call_status as CallListItem["callStatus"],
      callDate: row.call_date as string,
      callTime: row.call_time as string,
      durationSeconds: Number(row.duration_seconds ?? 0),
      assignedExecutive: row.assignee_id
        ? {
            id: row.assignee_id as number,
            uuid: row.assignee_uuid as string,
            employeeCode: row.assignee_employee_code as string,
            displayName: (row.assignee_display_name as string | null) ?? null,
          }
        : null,
      notes: (row.notes as string | null) ?? null,
      followup: row.followup_id
        ? {
            id: row.followup_id as number,
            uuid: row.followup_uuid as string,
            followupDate: row.followup_date as string,
            followupTime: row.followup_time as string,
            status: row.followup_status as string,
          }
        : null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDetail(row: DbRow): CallDetail {
    return {
      ...this.mapToListItem(row),
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
