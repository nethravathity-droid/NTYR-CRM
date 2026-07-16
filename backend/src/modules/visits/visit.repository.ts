import type { Knex } from "knex";
import type {
  CreateVisitData,
  PaginatedVisits,
  UpdateVisitData,
  VisitAuditEntry,
  VisitDetail,
  VisitListItem,
  VisitRecord,
} from "./visit.types.js";
import type { ListVisitsQuery } from "./visit.validation.js";

const VISIT_LIST_SELECT = [
  "v.id",
  "v.uuid",
  "v.visit_number",
  "v.customer_name",
  "v.mobile",
  "v.visit_date",
  "v.visit_time",
  "v.status",
  "v.transportation_required",
  "v.pickup_location",
  "v.feedback",
  "v.rating",
  "v.next_action",
  "v.notes",
  "v.created_at",
  "v.updated_at",
  "v.created_by",
  "v.updated_by",
  "l.id as lead_id",
  "l.uuid as lead_uuid",
  "l.lead_number",
  "l.customer_name as lead_customer_name",
  "l.mobile as lead_mobile",
  "p.id as project_id",
  "p.uuid as project_uuid",
  "p.project_name",
  "p.project_code",
  "u.id as unit_id",
  "u.uuid as unit_uuid",
  "u.unit_number",
  "a.id as assignee_id",
  "a.uuid as assignee_uuid",
  "a.employee_code as assignee_employee_code",
  "a.display_name as assignee_display_name",
] as const;

export class VisitsRepository {
  constructor(private readonly db: Knex) {}

  async listVisits(companyId: number, query: ListVisitsQuery): Promise<PaginatedVisits> {
    const baseQuery = this.buildListQuery(companyId, query);
    const countResult = await baseQuery.clone().countDistinct("v.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(VISIT_LIST_SELECT)
      .orderBy(this.resolveSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      visits: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findVisitByUuid(companyId: number, uuid: string): Promise<VisitDetail | null> {
    const row = await this.buildListQuery(companyId, { page: 1, limit: 1, sortBy: "visit_date", sortOrder: "asc" })
      .clone()
      .where("v.uuid", uuid)
      .select(VISIT_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  async findVisitRecordByUuid(companyId: number, uuid: string): Promise<VisitRecord | null> {
    const record = await this.db<VisitRecord>("site_visits")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return record ?? null;
  }

  async createVisit(companyId: number, data: CreateVisitData, createdBy: number): Promise<VisitDetail> {
    return this.db.transaction(async (trx) => {
      const visitNumber = await this.generateVisitNumber(companyId, trx);

      const [inserted] = await trx("site_visits")
        .insert({
          company_id: companyId,
          visit_number: visitNumber,
          lead_id: data.leadId ?? null,
          customer_name: data.customerName,
          mobile: data.mobile,
          project_id: data.projectId ?? null,
          unit_id: data.unitId ?? null,
          visit_date: data.visitDate,
          visit_time: data.visitTime,
          assigned_user_id: data.assignedUserId ?? null,
          status: data.status ?? "SCHEDULED",
          transportation_required: data.transportationRequired ?? false,
          pickup_location: data.pickupLocation ?? null,
          feedback: data.feedback ?? null,
          rating: data.rating ?? null,
          next_action: data.nextAction ?? null,
          notes: data.notes ?? null,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning(["id", "uuid"]);

      await this.insertAuditLog(trx, companyId, inserted.id, "CREATED", { visitNumber }, createdBy);

      const visit = await this.findVisitByUuidInTrx(trx, companyId, inserted.uuid);
      if (!visit) {
        throw new Error("Failed to retrieve created visit");
      }

      return visit;
    });
  }

  async updateVisit(companyId: number, visitId: number, data: UpdateVisitData, updatedBy: number): Promise<VisitDetail | null> {
    const existing = await this.db<VisitRecord>("site_visits")
      .where({ id: visitId, company_id: companyId })
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
    if (data.projectId !== undefined) updatePayload.project_id = data.projectId;
    if (data.unitId !== undefined) updatePayload.unit_id = data.unitId;
    if (data.visitDate !== undefined) updatePayload.visit_date = data.visitDate;
    if (data.visitTime !== undefined) updatePayload.visit_time = data.visitTime;
    if (data.assignedUserId !== undefined) updatePayload.assigned_user_id = data.assignedUserId;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.transportationRequired !== undefined) updatePayload.transportation_required = data.transportationRequired;
    if (data.pickupLocation !== undefined) updatePayload.pickup_location = data.pickupLocation;
    if (data.feedback !== undefined) updatePayload.feedback = data.feedback;
    if (data.rating !== undefined) updatePayload.rating = data.rating;
    if (data.nextAction !== undefined) updatePayload.next_action = data.nextAction;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    await this.db.transaction(async (trx) => {
      await trx("site_visits").where({ id: visitId, company_id: companyId }).update(updatePayload);
      await this.insertAuditLog(trx, companyId, visitId, "UPDATED", data, updatedBy);
    });

    return this.findVisitByUuid(companyId, existing.uuid);
  }

  async softDeleteVisit(companyId: number, visitId: number, deletedBy: number): Promise<boolean> {
    const existing = await this.db<VisitRecord>("site_visits")
      .where({ id: visitId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return false;
    }

    await this.db.transaction(async (trx) => {
      await trx("site_visits")
        .where({ id: visitId, company_id: companyId })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: deletedBy,
          updated_at: trx.fn.now(),
          updated_by: deletedBy,
        });

      await this.insertAuditLog(trx, companyId, visitId, "DELETED", { visitNumber: existing.visit_number }, deletedBy);
    });

    return true;
  }

  async markCompleted(companyId: number, visitId: number, input: { feedback?: string | null; rating?: number | null; nextAction?: string | null; notes?: string | null }, updatedBy: number): Promise<VisitDetail | null> {
    return this.updateVisit(companyId, visitId, {
      status: "COMPLETED",
      feedback: input.feedback,
      rating: input.rating,
      nextAction: input.nextAction,
      notes: input.notes,
    }, updatedBy).then(async (visit) => {
      if (visit) {
        await this.insertAuditLog(this.db, companyId, visitId, "COMPLETED", input, updatedBy);
      }
      return visit;
    });
  }

  async markCancelled(companyId: number, visitId: number, input: { notes?: string | null }, updatedBy: number): Promise<VisitDetail | null> {
    return this.updateVisit(companyId, visitId, {
      status: "CANCELLED",
      notes: input.notes,
    }, updatedBy).then(async (visit) => {
      if (visit) {
        await this.insertAuditLog(this.db, companyId, visitId, "CANCELLED", input, updatedBy);
      }
      return visit;
    });
  }

  async getAuditTrail(companyId: number, visitId: number): Promise<VisitAuditEntry[]> {
    const rows = await this.db("visit_audit_logs as al")
      .leftJoin("users as u", "u.id", "al.performed_by")
      .where({ "al.company_id": companyId, "al.visit_id": visitId })
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

    return rows.map((row) => ({
      id: row.id as number,
      uuid: row.uuid as string,
      action: row.action as string,
      changes: (row.changes as Record<string, unknown> | null) ?? null,
      performedBy: (row.performed_by as number | null) ?? null,
      performerName: (row.performer_name as string | null) ?? null,
      createdAt: row.created_at as string,
    }));
  }

  async getFormOptions(companyId: number) {
    const [assignees, leads, projects, units] = await Promise.all([
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
      this.db("projects")
        .select("id", "uuid", "project_name as projectName", "project_code as projectCode")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("project_name", "asc"),
      this.db("units")
        .select("id", "uuid", "project_id as projectId", "unit_number as unitNumber")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("unit_number", "asc")
        .limit(1000),
    ]);

    return {
      assignees,
      leads,
      projects,
      units,
      statuses: ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
    };
  }

  private buildListQuery(companyId: number, query: Partial<ListVisitsQuery>) {
    const baseQuery = this.db("site_visits as v")
      .leftJoin("leads as l", "l.id", "v.lead_id")
      .leftJoin("projects as p", "p.id", "v.project_id")
      .leftJoin("units as u", "u.id", "v.unit_id")
      .leftJoin("users as a", "a.id", "v.assigned_user_id")
      .where("v.company_id", companyId)
      .whereNull("v.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("v.customer_name", term)
          .orWhereILike("v.mobile", term)
          .orWhereILike("v.visit_number", term)
          .orWhereILike("l.lead_number", term)
          .orWhereILike("p.project_name", term);
      });
    }

    if (query.status) baseQuery.where("v.status", query.status);
    if (query.assignedUserId) baseQuery.where("v.assigned_user_id", query.assignedUserId);
    if (query.projectId) baseQuery.where("v.project_id", query.projectId);
    if (query.leadId) baseQuery.where("v.lead_id", query.leadId);
    if (query.date) baseQuery.where("v.visit_date", query.date);
    if (query.fromDate) baseQuery.where("v.visit_date", ">=", query.fromDate);
    if (query.toDate) baseQuery.where("v.visit_date", "<=", query.toDate);

    return baseQuery;
  }

  private async findVisitByUuidInTrx(trx: Knex.Transaction, companyId: number, uuid: string): Promise<VisitDetail | null> {
    const row = await trx("site_visits as v")
      .leftJoin("leads as l", "l.id", "v.lead_id")
      .leftJoin("projects as p", "p.id", "v.project_id")
      .leftJoin("units as u", "u.id", "v.unit_id")
      .leftJoin("users as a", "a.id", "v.assigned_user_id")
      .where("v.company_id", companyId)
      .where("v.uuid", uuid)
      .whereNull("v.deleted_at")
      .select(VISIT_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  private async generateVisitNumber(companyId: number, trx: Knex.Transaction): Promise<string> {
    const last = await trx("site_visits")
      .where({ company_id: companyId })
      .orderBy("id", "desc")
      .select("visit_number")
      .forUpdate()
      .first<{ visit_number: string }>();

    let next = 1;
    if (last?.visit_number) {
      const match = last.visit_number.match(/(\d+)$/);
      if (match?.[1]) {
        next = Number.parseInt(match[1], 10) + 1;
      }
    }

    return `SV-${String(next).padStart(6, "0")}`;
  }

  private async insertAuditLog(
    trx: Knex | Knex.Transaction,
    companyId: number,
    visitId: number,
    action: string,
    changes: Record<string, unknown>,
    performedBy: number,
  ): Promise<void> {
    await trx("visit_audit_logs").insert({
      company_id: companyId,
      visit_id: visitId,
      action,
      changes: JSON.stringify(changes),
      performed_by: performedBy,
    });
  }

  private resolveSortColumn(sortBy: ListVisitsQuery["sortBy"]): string {
    const columns: Record<ListVisitsQuery["sortBy"], string> = {
      visit_date: "v.visit_date",
      visit_time: "v.visit_time",
      customer_name: "v.customer_name",
      created_at: "v.created_at",
      status: "v.status",
    };

    return columns[sortBy];
  }

  private mapToListItem(row: Record<string, unknown>): VisitListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      visitNumber: row.visit_number as string,
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
      project: row.project_id
        ? {
            id: row.project_id as number,
            uuid: row.project_uuid as string,
            projectName: row.project_name as string,
            projectCode: row.project_code as string,
          }
        : null,
      unit: row.unit_id
        ? {
            id: row.unit_id as number,
            uuid: row.unit_uuid as string,
            unitNumber: row.unit_number as string,
          }
        : null,
      visitDate: row.visit_date as string,
      visitTime: row.visit_time as string,
      assignedExecutive: row.assignee_id
        ? {
            id: row.assignee_id as number,
            uuid: row.assignee_uuid as string,
            employeeCode: row.assignee_employee_code as string,
            displayName: (row.assignee_display_name as string | null) ?? null,
          }
        : null,
      status: row.status as VisitListItem["status"],
      transportationRequired: Boolean(row.transportation_required),
      pickupLocation: (row.pickup_location as string | null) ?? null,
      feedback: (row.feedback as string | null) ?? null,
      rating: row.rating != null ? Number(row.rating) : null,
      nextAction: (row.next_action as string | null) ?? null,
      notes: (row.notes as string | null) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDetail(row: Record<string, unknown>): VisitDetail {
    return {
      ...this.mapToListItem(row),
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
