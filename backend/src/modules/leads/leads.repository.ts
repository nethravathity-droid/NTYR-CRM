import type { Knex } from "knex";
import type {
  AssignLeadsResult,
  BulkUpdateLeadsResult,
  CreateLeadData,
  DuplicateLeadMatch,
  LeadAuditAction,
  LeadAuditEntry,
  LeadDetail,
  LeadFormOptions,
  LeadListItem,
  LeadPriorityApi,
  LeadPriorityDb,
  LeadRecord,
  LeadStatus,
  ListLeadsQuery,
  PaginatedLeadsResult,
  UpdateLeadData,
} from "./leads.types.js";
import { PRIORITY_API_TO_DB, PRIORITY_DB_TO_API } from "./leads.types.js";

const LEAD_LIST_SELECT = [
  "l.id",
  "l.uuid",
  "l.lead_number",
  "l.customer_name",
  "l.mobile",
  "l.alternate_mobile",
  "l.email",
  "l.project_interested",
  "l.budget",
  "l.property_type",
  "l.lead_source",
  "l.campaign",
  "l.city",
  "l.priority",
  "l.status",
  "l.created_at",
  "l.updated_at",
  "l.assigned_user_id",
  "u.uuid as assignee_uuid",
  "u.employee_code as assignee_employee_code",
  "u.display_name as assignee_display_name",
] as const;

export class LeadsRepository {
  constructor(private readonly db: Knex) {}

  async listLeads(
    companyId: number,
    query: ListLeadsQuery,
  ): Promise<PaginatedLeadsResult> {
    const baseQuery = this.buildListQuery(companyId, query);

    const countResult = await baseQuery
      .clone()
      .countDistinct("l.id as total")
      .first<{ total: string }>();

    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const sortColumn = this.resolveSortColumn(query.sortBy);

    const rows = await baseQuery
      .clone()
      .select(LEAD_LIST_SELECT)
      .orderBy(sortColumn, query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      leads: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findLeadByUuid(
    companyId: number,
    uuid: string,
  ): Promise<LeadDetail | null> {
    const row = await this.db("leads as l")
      .leftJoin("users as u", "u.id", "l.assigned_user_id")
      .select([
        ...LEAD_LIST_SELECT,
        "l.notes",
        "l.created_by",
        "l.updated_by",
      ])
      .where("l.company_id", companyId)
      .where("l.uuid", uuid)
      .whereNull("l.deleted_at")
      .first();

    if (!row) {
      return null;
    }

    return this.mapToDetail(row);
  }

  async findLeadRecordByUuid(
    companyId: number,
    uuid: string,
  ): Promise<LeadRecord | null> {
    const lead = await this.db<LeadRecord>("leads")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return lead ?? null;
  }

  async createLead(
    companyId: number,
    data: CreateLeadData,
    createdBy: number,
  ): Promise<LeadDetail> {
    return this.db.transaction(async (trx) => {
      const leadNumber = await this.generateLeadNumber(companyId, trx);
      const priorityDb = this.toDbPriority(data.priority ?? "WARM");
      const status = data.status ?? (data.assignedUserId ? "ASSIGNED" : "NEW");

      const [inserted] = await trx("leads")
        .insert({
          company_id: companyId,
          lead_number: leadNumber,
          customer_name: data.customerName,
          mobile: data.mobile,
          alternate_mobile: data.alternateMobile ?? null,
          email: data.email ?? null,
          project_interested: data.projectInterested ?? null,
          budget: data.budget ?? null,
          property_type: data.propertyType ?? null,
          lead_source: data.leadSource ?? null,
          campaign: data.campaign ?? null,
          city: data.city ?? null,
          assigned_user_id: data.assignedUserId ?? null,
          priority: priorityDb,
          status,
          notes: data.notes ?? null,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning(["id", "uuid"]);

      await this.insertAuditLog(trx, {
        companyId,
        leadId: inserted.id,
        action: "CREATED",
        changes: { leadNumber, customerName: data.customerName },
        performedBy: createdBy,
      });

      const lead = await this.findLeadByUuidInTrx(trx, companyId, inserted.uuid);
      if (!lead) {
        throw new Error("Failed to retrieve created lead");
      }

      return lead;
    });
  }

  async updateLead(
    companyId: number,
    leadId: number,
    data: UpdateLeadData,
    updatedBy: number,
  ): Promise<LeadDetail | null> {
    return this.db.transaction(async (trx) => {
      const existing = await trx<LeadRecord>("leads")
        .where({ id: leadId, company_id: companyId })
        .whereNull("deleted_at")
        .first();

      if (!existing) {
        return null;
      }

      const updatePayload: Record<string, unknown> = {
        updated_by: updatedBy,
        updated_at: trx.fn.now(),
      };

      const changes: Record<string, { from: unknown; to: unknown }> = {};

      const applyField = <K extends keyof LeadRecord>(
        key: K,
        column: string,
        value: LeadRecord[K] | undefined,
      ) => {
        if (value === undefined) {
          return;
        }

        if (existing[key] !== value) {
          changes[column] = { from: existing[key], to: value };
        }

        updatePayload[column] = value;
      };

      if (data.customerName !== undefined) {
        applyField("customer_name", "customer_name", data.customerName);
      }
      if (data.mobile !== undefined) {
        applyField("mobile", "mobile", data.mobile);
      }
      if (data.alternateMobile !== undefined) {
        applyField(
          "alternate_mobile",
          "alternate_mobile",
          data.alternateMobile,
        );
      }
      if (data.email !== undefined) {
        applyField("email", "email", data.email);
      }
      if (data.projectInterested !== undefined) {
        applyField(
          "project_interested",
          "project_interested",
          data.projectInterested,
        );
      }
      if (data.budget !== undefined) {
        applyField("budget", "budget", data.budget?.toString() ?? null);
      }
      if (data.propertyType !== undefined) {
        applyField("property_type", "property_type", data.propertyType);
      }
      if (data.leadSource !== undefined) {
        applyField("lead_source", "lead_source", data.leadSource);
      }
      if (data.campaign !== undefined) {
        applyField("campaign", "campaign", data.campaign);
      }
      if (data.city !== undefined) {
        applyField("city", "city", data.city);
      }
      if (data.assignedUserId !== undefined) {
        applyField("assigned_user_id", "assigned_user_id", data.assignedUserId);
      }
      if (data.priority !== undefined) {
        const priorityDb = this.toDbPriority(data.priority);
        applyField("priority", "priority", priorityDb);
      }
      if (data.status !== undefined) {
        applyField("status", "status", data.status);
      }
      if (data.notes !== undefined) {
        applyField("notes", "notes", data.notes);
      }

      if (Object.keys(changes).length === 0) {
        return this.findLeadByUuidInTrx(trx, companyId, existing.uuid);
      }

      await trx("leads")
        .where({ id: leadId, company_id: companyId })
        .update(updatePayload);

      await this.insertAuditLog(trx, {
        companyId,
        leadId,
        action: "UPDATED",
        changes,
        performedBy: updatedBy,
      });

      return this.findLeadByUuidInTrx(trx, companyId, existing.uuid);
    });
  }

  async softDeleteLead(
    companyId: number,
    leadId: number,
    deletedBy: number,
  ): Promise<boolean> {
    return this.db.transaction(async (trx) => {
      const existing = await trx<LeadRecord>("leads")
        .where({ id: leadId, company_id: companyId })
        .whereNull("deleted_at")
        .first();

      if (!existing) {
        return false;
      }

      await trx("leads")
        .where({ id: leadId, company_id: companyId })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: deletedBy,
          updated_at: trx.fn.now(),
          updated_by: deletedBy,
        });

      await this.insertAuditLog(trx, {
        companyId,
        leadId,
        action: "DELETED",
        changes: { leadNumber: existing.lead_number },
        performedBy: deletedBy,
      });

      return true;
    });
  }

  async assignLeads(
    companyId: number,
    leadUuids: string[],
    assignedUserId: number,
    performedBy: number,
  ): Promise<AssignLeadsResult> {
    let assigned = 0;
    let failed = 0;

    await this.db.transaction(async (trx) => {
      for (const uuid of leadUuids) {
        const lead = await trx<LeadRecord>("leads")
          .where({ company_id: companyId, uuid })
          .whereNull("deleted_at")
          .first();

        if (!lead) {
          failed += 1;
          continue;
        }

        await trx("leads")
          .where({ id: lead.id })
          .update({
            assigned_user_id: assignedUserId,
            status: lead.status === "NEW" ? "ASSIGNED" : lead.status,
            updated_by: performedBy,
            updated_at: trx.fn.now(),
          });

        await this.insertAuditLog(trx, {
          companyId,
          leadId: lead.id,
          action: "ASSIGNED",
          changes: {
            assignedUserId: { from: lead.assigned_user_id, to: assignedUserId },
          },
          performedBy,
        });

        assigned += 1;
      }
    });

    return { assigned, failed };
  }

  async bulkUpdateLeads(
    companyId: number,
    leadUuids: string[],
    updates: {
      status?: LeadStatus;
      priority?: LeadPriorityApi;
      assignedUserId?: number | null;
    },
    performedBy: number,
  ): Promise<BulkUpdateLeadsResult> {
    let updated = 0;
    let failed = 0;

    await this.db.transaction(async (trx) => {
      for (const uuid of leadUuids) {
        const lead = await trx<LeadRecord>("leads")
          .where({ company_id: companyId, uuid })
          .whereNull("deleted_at")
          .first();

        if (!lead) {
          failed += 1;
          continue;
        }

        const updatePayload: Record<string, unknown> = {
          updated_by: performedBy,
          updated_at: trx.fn.now(),
        };
        const changes: Record<string, { from: unknown; to: unknown }> = {};

        if (updates.status !== undefined && updates.status !== lead.status) {
          changes.status = { from: lead.status, to: updates.status };
          updatePayload.status = updates.status;
        }

        if (updates.priority !== undefined) {
          const priorityDb = this.toDbPriority(updates.priority);
          if (priorityDb !== lead.priority) {
            changes.priority = { from: lead.priority, to: priorityDb };
            updatePayload.priority = priorityDb;
          }
        }

        if (updates.assignedUserId !== undefined) {
          if (updates.assignedUserId !== lead.assigned_user_id) {
            changes.assignedUserId = {
              from: lead.assigned_user_id,
              to: updates.assignedUserId,
            };
            updatePayload.assigned_user_id = updates.assignedUserId;

            if (
              lead.status === "NEW" &&
              updates.assignedUserId &&
              !updates.status
            ) {
              updatePayload.status = "ASSIGNED";
              changes.status = { from: lead.status, to: "ASSIGNED" };
            }
          }
        }

        if (Object.keys(changes).length === 0) {
          updated += 1;
          continue;
        }

        await trx("leads").where({ id: lead.id }).update(updatePayload);

        await this.insertAuditLog(trx, {
          companyId,
          leadId: lead.id,
          action: "BULK_UPDATED",
          changes,
          performedBy,
        });

        updated += 1;
      }
    });

    return { updated, failed };
  }

  async findDuplicateByMobile(
    companyId: number,
    mobile: string,
    excludeLeadId?: number,
  ): Promise<DuplicateLeadMatch | null> {
    const query = this.db("leads")
      .select("uuid", "lead_number", "customer_name", "mobile", "email")
      .where({ company_id: companyId })
      .whereRaw(
        "regexp_replace(mobile, '\\D', '', 'g') = regexp_replace(?, '\\D', '', 'g')",
        [mobile],
      )
      .whereNull("deleted_at");

    if (excludeLeadId) {
      query.whereNot("id", excludeLeadId);
    }

    const row = await query.first();
    return row ? this.mapDuplicate(row) : null;
  }

  async findDuplicateByEmail(
    companyId: number,
    email: string,
    excludeLeadId?: number,
  ): Promise<DuplicateLeadMatch | null> {
    const query = this.db("leads")
      .select("uuid", "lead_number", "customer_name", "mobile", "email")
      .where({ company_id: companyId })
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .whereNull("deleted_at");

    if (excludeLeadId) {
      query.whereNot("id", excludeLeadId);
    }

    const row = await query.first();
    return row ? this.mapDuplicate(row) : null;
  }

  async assigneeExists(companyId: number, userId: number): Promise<boolean> {
    const user = await this.db("users")
      .where({ id: userId, company_id: companyId, status: "ACTIVE" })
      .whereNull("deleted_at")
      .first();

    return Boolean(user);
  }

  async listAssigneeOptions(companyId: number) {
    return this.db("users")
      .select(
        "id",
        "uuid",
        "employee_code as employeeCode",
        "display_name as displayName",
      )
      .where({ company_id: companyId, status: "ACTIVE" })
      .whereNull("deleted_at")
      .orderBy("display_name", "asc");
  }

  async getFormOptions(companyId: number): Promise<LeadFormOptions> {
    const [assignees, leadSources, propertyTypes] = await Promise.all([
      this.listAssigneeOptions(companyId),
      this.db("leads")
        .distinct("lead_source")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereNotNull("lead_source")
        .orderBy("lead_source", "asc")
        .pluck("lead_source"),
      this.db("leads")
        .distinct("property_type")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereNotNull("property_type")
        .orderBy("property_type", "asc")
        .pluck("property_type"),
    ]);

    return {
      assignees,
      statuses: [
        "NEW",
        "ASSIGNED",
        "CONTACTED",
        "FOLLOW_UP",
        "VISIT_SCHEDULED",
        "VISITED",
        "NEGOTIATION",
        "BOOKED",
        "LOST",
      ],
      priorities: ["COLD", "WARM", "HOT"],
      leadSources,
      propertyTypes,
    };
  }

  async getAuditTrail(
    companyId: number,
    leadId: number,
    limit = 50,
  ): Promise<LeadAuditEntry[]> {
    const rows = await this.db("lead_audit_logs as a")
      .leftJoin("users as u", "u.id", "a.performed_by")
      .select(
        "a.id",
        "a.uuid",
        "a.action",
        "a.changes",
        "a.created_at",
        "u.id as performer_id",
        "u.display_name as performer_display_name",
      )
      .where({ "a.company_id": companyId, "a.lead_id": leadId })
      .orderBy("a.created_at", "desc")
      .limit(limit);

    return rows.map((row) => ({
      id: row.id as number,
      uuid: row.uuid as string,
      action: row.action as LeadAuditAction,
      changes: (row.changes as Record<string, unknown> | null) ?? null,
      performedBy: row.performer_id
        ? {
            id: row.performer_id as number,
            displayName: row.performer_display_name as string | null,
          }
        : null,
      createdAt: row.created_at as Date,
    }));
  }

  async countLeads(companyId: number): Promise<number> {
    const result = await this.db("leads")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .count("id as total")
      .first<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async countAllLeads(): Promise<number> {
    const result = await this.db("leads")
      .whereNull("deleted_at")
      .count("id as total")
      .first<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async getLeadGrowthByMonth(companyId: number | null, months: number) {
    const query = this.db("leads")
      .whereNull("deleted_at")
      .where(
        "created_at",
        ">=",
        this.db.raw("date_trunc('month', NOW()) - ?::interval", [
          `${months - 1} months`,
        ]),
      );

    if (companyId) {
      query.where({ company_id: companyId });
    }

    return query
      .select(
        this.db.raw(
          "to_char(date_trunc('month', created_at), 'YYYY-MM') as period",
        ),
      )
      .count("id as count")
      .groupByRaw("date_trunc('month', created_at)")
      .orderByRaw("date_trunc('month', created_at) asc");
  }

  async insertImportedLeadAudit(
    companyId: number,
    leadId: number,
    performedBy: number,
    source: string,
  ): Promise<void> {
    await this.insertAuditLog(this.db, {
      companyId,
      leadId,
      action: "IMPORTED",
      changes: { source },
      performedBy,
    });
  }

  private buildListQuery(companyId: number, query: ListLeadsQuery) {
    const baseQuery = this.db("leads as l")
      .leftJoin("users as u", "u.id", "l.assigned_user_id")
      .where("l.company_id", companyId)
      .whereNull("l.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("l.customer_name", term)
          .orWhereILike("l.lead_number", term)
          .orWhereILike("l.mobile", term)
          .orWhereILike("l.email", term)
          .orWhereILike("l.project_interested", term)
          .orWhereILike("l.city", term);
      });
    }

    if (query.status) {
      baseQuery.where("l.status", query.status);
    }

    if (query.priority) {
      baseQuery.where("l.priority", this.toDbPriority(query.priority));
    }

    if (query.assignedUserId) {
      baseQuery.where("l.assigned_user_id", query.assignedUserId);
    }

    if (query.leadSource) {
      baseQuery.whereILike("l.lead_source", query.leadSource);
    }

    if (query.propertyType) {
      baseQuery.whereILike("l.property_type", query.propertyType);
    }

    if (query.city) {
      baseQuery.whereILike("l.city", `%${query.city}%`);
    }

    if (query.campaign) {
      baseQuery.whereILike("l.campaign", `%${query.campaign}%`);
    }

    return baseQuery;
  }

  private resolveSortColumn(sortBy: ListLeadsQuery["sortBy"]): string {
    const columns: Record<ListLeadsQuery["sortBy"], string> = {
      created_at: "l.created_at",
      updated_at: "l.updated_at",
      customer_name: "l.customer_name",
      lead_number: "l.lead_number",
      budget: "l.budget",
      status: "l.status",
      priority: "l.priority",
    };

    return columns[sortBy];
  }

  private async generateLeadNumber(
    companyId: number,
    trx: Knex.Transaction,
  ): Promise<string> {
    const last = await trx("leads")
      .where({ company_id: companyId })
      .orderBy("id", "desc")
      .select("lead_number")
      .forUpdate()
      .first<{ lead_number: string }>();

    let next = 1;

    if (last?.lead_number) {
      const match = last.lead_number.match(/(\d+)$/);
      if (match) {
        next = Number.parseInt(match[1], 10) + 1;
      }
    }

    return `LD-${String(next).padStart(6, "0")}`;
  }

  private async findLeadByUuidInTrx(
    trx: Knex.Transaction,
    companyId: number,
    uuid: string,
  ): Promise<LeadDetail | null> {
    const row = await trx("leads as l")
      .leftJoin("users as u", "u.id", "l.assigned_user_id")
      .select([
        ...LEAD_LIST_SELECT,
        "l.notes",
        "l.created_by",
        "l.updated_by",
      ])
      .where("l.company_id", companyId)
      .where("l.uuid", uuid)
      .whereNull("l.deleted_at")
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  private async insertAuditLog(
    trx: Knex | Knex.Transaction,
    input: {
      companyId: number;
      leadId: number;
      action: LeadAuditAction;
      changes: Record<string, unknown>;
      performedBy: number;
    },
  ): Promise<void> {
    await trx("lead_audit_logs").insert({
      company_id: input.companyId,
      lead_id: input.leadId,
      action: input.action,
      changes: JSON.stringify(input.changes),
      performed_by: input.performedBy,
    });
  }

  private toDbPriority(priority: LeadPriorityApi): LeadPriorityDb {
    return PRIORITY_API_TO_DB[priority];
  }

  private toApiPriority(priority: LeadPriorityDb): LeadPriorityApi {
    return PRIORITY_DB_TO_API[priority];
  }

  private mapDuplicate(row: Record<string, unknown>): DuplicateLeadMatch {
    return {
      uuid: row.uuid as string,
      leadNumber: row.lead_number as string,
      customerName: row.customer_name as string,
      mobile: row.mobile as string,
      email: (row.email as string | null) ?? null,
    };
  }

  private mapToListItem(row: Record<string, unknown>): LeadListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      leadNumber: row.lead_number as string,
      customerName: row.customer_name as string,
      mobile: row.mobile as string,
      alternateMobile: (row.alternate_mobile as string | null) ?? null,
      email: (row.email as string | null) ?? null,
      projectInterested: (row.project_interested as string | null) ?? null,
      budget: row.budget != null ? Number(row.budget) : null,
      propertyType: (row.property_type as string | null) ?? null,
      leadSource: (row.lead_source as string | null) ?? null,
      campaign: (row.campaign as string | null) ?? null,
      city: (row.city as string | null) ?? null,
      priority: this.toApiPriority(row.priority as LeadPriorityDb),
      status: row.status as LeadStatus,
      assignedEmployee: row.assigned_user_id
        ? {
            id: row.assigned_user_id as number,
            uuid: row.assignee_uuid as string,
            employeeCode: row.assignee_employee_code as string,
            displayName: (row.assignee_display_name as string | null) ?? null,
          }
        : null,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  private mapToDetail(row: Record<string, unknown>): LeadDetail {
    return {
      ...this.mapToListItem(row),
      notes: (row.notes as string | null) ?? null,
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
