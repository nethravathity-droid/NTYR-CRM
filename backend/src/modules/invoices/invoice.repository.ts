import type { Knex } from "knex";
import type {
  CreateInvoiceData,
  InvoiceAuditEntry,
  InvoiceDetail,
  InvoiceListItem,
  InvoiceRecord,
  PaginatedInvoices,
  UpdateInvoiceData,
} from "./invoice.types.js";
import type { ListInvoicesQuery } from "./invoice.validation.js";

const INVOICE_LIST_SELECT = [
  "i.id",
  "i.uuid",
  "i.invoice_number",
  "i.customer_name",
  "i.customer_email",
  "i.customer_phone",
  "i.customer_address",
  "i.line_items",
  "i.subtotal",
  "i.tax_rate",
  "i.tax_amount",
  "i.discount",
  "i.total",
  "i.due_date",
  "i.status",
  "i.notes",
  "i.terms",
  "i.created_at",
  "i.updated_at",
  "b.id as booking_id",
  "b.uuid as booking_uuid",
  "b.booking_number",
  "pr.id as project_id",
  "pr.uuid as project_uuid",
  "pr.project_name",
  "pr.project_code",
  "u.id as unit_id",
  "u.uuid as unit_uuid",
  "u.unit_number",
] as const;

export class InvoicesRepository {
  constructor(private readonly db: Knex) {}

  async listInvoices(companyId: number, query: ListInvoicesQuery): Promise<PaginatedInvoices> {
    const baseQuery = this.buildListQuery(companyId, query);
    const countResult = await baseQuery.clone().countDistinct("i.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(INVOICE_LIST_SELECT)
      .orderBy(this.resolveSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      invoices: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findInvoiceByUuid(companyId: number, uuid: string): Promise<InvoiceDetail | null> {
    const row = await this.buildListQuery(companyId, { page: 1, limit: 1, sortBy: "created_at", sortOrder: "desc" })
      .clone()
      .where("i.uuid", uuid)
      .select(INVOICE_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  async findInvoiceRecordByUuid(companyId: number, uuid: string): Promise<InvoiceRecord | null> {
    const record = await this.db<InvoiceRecord>("invoices")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return record ?? null;
  }

  async createInvoice(companyId: number, data: CreateInvoiceData, createdBy: number): Promise<InvoiceDetail> {
    return this.db.transaction(async (trx) => {
      const invoiceNumber = await this.generateInvoiceNumber(companyId, trx);

      const [inserted] = await trx("invoices")
        .insert({
          company_id: companyId,
          invoice_number: invoiceNumber,
          customer_name: data.customerName,
          customer_email: data.customerEmail ?? null,
          customer_phone: data.customerPhone ?? null,
          customer_address: data.customerAddress ?? null,
          booking_id: data.bookingId ?? null,
          project_id: data.projectId ?? null,
          unit_id: data.unitId ?? null,
          line_items: data.lineItems,
          subtotal: data.subtotal,
          tax_rate: data.taxRate ?? 0,
          tax_amount: data.taxAmount ?? 0,
          discount: data.discount ?? 0,
          total: data.total,
          due_date: data.dueDate,
          status: data.status ?? "DRAFT",
          notes: data.notes ?? null,
          terms: data.terms ?? null,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning(["id", "uuid"]);

      await this.insertAuditLog(trx, companyId, inserted.id, "CREATED", { invoiceNumber }, createdBy);

      const invoice = await this.findInvoiceByUuidInTrx(trx, companyId, inserted.uuid);
      if (!invoice) {
        throw new Error("Failed to retrieve created invoice");
      }

      return invoice;
    });
  }

  async updateInvoice(companyId: number, invoiceId: number, data: UpdateInvoiceData, updatedBy: number): Promise<InvoiceDetail | null> {
    const existing = await this.db<InvoiceRecord>("invoices")
      .where({ id: invoiceId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.customerName !== undefined) updatePayload.customer_name = data.customerName;
    if (data.customerEmail !== undefined) updatePayload.customer_email = data.customerEmail;
    if (data.customerPhone !== undefined) updatePayload.customer_phone = data.customerPhone;
    if (data.customerAddress !== undefined) updatePayload.customer_address = data.customerAddress;
    if (data.bookingId !== undefined) updatePayload.booking_id = data.bookingId;
    if (data.projectId !== undefined) updatePayload.project_id = data.projectId;
    if (data.unitId !== undefined) updatePayload.unit_id = data.unitId;
    if (data.lineItems !== undefined) updatePayload.line_items = data.lineItems;
    if (data.subtotal !== undefined) updatePayload.subtotal = data.subtotal;
    if (data.taxRate !== undefined) updatePayload.tax_rate = data.taxRate;
    if (data.taxAmount !== undefined) updatePayload.tax_amount = data.taxAmount;
    if (data.discount !== undefined) updatePayload.discount = data.discount;
    if (data.total !== undefined) updatePayload.total = data.total;
    if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.terms !== undefined) updatePayload.terms = data.terms;

    await this.db.transaction(async (trx) => {
      await trx("invoices").where({ id: invoiceId, company_id: companyId }).update(updatePayload);
      await this.insertAuditLog(trx, companyId, invoiceId, "UPDATED", data, updatedBy);
    });

    return this.findInvoiceByUuid(companyId, existing.uuid);
  }

  async softDeleteInvoice(companyId: number, invoiceId: number, deletedBy: number): Promise<boolean> {
    const existing = await this.db<InvoiceRecord>("invoices")
      .where({ id: invoiceId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return false;
    }

    await this.db.transaction(async (trx) => {
      await trx("invoices")
        .where({ id: invoiceId, company_id: companyId })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: deletedBy,
          updated_at: trx.fn.now(),
          updated_by: deletedBy,
        });

      await this.insertAuditLog(trx, companyId, invoiceId, "DELETED", { invoiceNumber: existing.invoice_number }, deletedBy);
    });

    return true;
  }

  async getAuditTrail(companyId: number, invoiceId: number): Promise<InvoiceAuditEntry[]> {
    const rows = await this.db("invoice_audit_logs as al")
      .leftJoin("users as u", "u.id", "al.performed_by")
      .where({ "al.company_id": companyId, "al.invoice_id": invoiceId })
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
      performedBy: row.performed_by as number | null,
      performerName: row.performer_name as string | null,
      createdAt: row.created_at as string,
    }));
  }

  async getFormOptions(companyId: number) {
    const [bookings, projects, units] = await Promise.all([
      this.db("bookings")
        .select("id", "uuid", "booking_number as bookingNumber", "customer_name as customerName", "project_id as projectId", "unit_id as unitId")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("booking_date", "desc")
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
        .limit(2000),
    ]);

    return {
      bookings,
      projects,
      units,
      statuses: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] as const,
    };
  }

  private buildListQuery(companyId: number, query: Partial<ListInvoicesQuery>) {
    const baseQuery = this.db("invoices as i")
      .leftJoin("bookings as b", "b.id", "i.booking_id")
      .leftJoin("projects as pr", "pr.id", "i.project_id")
      .leftJoin("units as u", "u.id", "i.unit_id")
      .where("i.company_id", companyId)
      .whereNull("i.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("i.customer_name", term)
          .orWhereILike("i.invoice_number", term)
          .orWhereILike("b.booking_number", term)
          .orWhereILike("pr.project_name", term)
          .orWhereILike("u.unit_number", term);
      });
    }

    if (query.status) baseQuery.where("i.status", query.status);
    if (query.bookingId) baseQuery.where("i.booking_id", query.bookingId);
    if (query.projectId) baseQuery.where("i.project_id", query.projectId);
    if (query.fromDueDate) baseQuery.where("i.due_date", ">=", query.fromDueDate);
    if (query.toDueDate) baseQuery.where("i.due_date", "<=", query.toDueDate);

    return baseQuery;
  }

  private async findInvoiceByUuidInTrx(trx: Knex.Transaction, companyId: number, uuid: string): Promise<InvoiceDetail | null> {
    const row = await trx("invoices as i")
      .leftJoin("bookings as b", "b.id", "i.booking_id")
      .leftJoin("projects as pr", "pr.id", "i.project_id")
      .leftJoin("units as u", "u.id", "i.unit_id")
      .where("i.company_id", companyId)
      .where("i.uuid", uuid)
      .whereNull("i.deleted_at")
      .select(INVOICE_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  private async generateInvoiceNumber(companyId: number, trx: Knex.Transaction): Promise<string> {
    const last = await trx("invoices")
      .where({ company_id: companyId })
      .orderBy("id", "desc")
      .select("invoice_number")
      .forUpdate()
      .first<{ invoice_number: string }>();

    let next = 1;
    if (last?.invoice_number) {
      const match = last.invoice_number.match(/(\d+)$/);
      if (match?.[1]) {
        next = Number.parseInt(match[1], 10) + 1;
      }
    }

    return `INV-${String(next).padStart(6, "0")}`;
  }

  private async insertAuditLog(
    trx: Knex | Knex.Transaction,
    companyId: number,
    invoiceId: number,
    action: string,
    changes: Record<string, unknown>,
    performedBy: number,
  ): Promise<void> {
    await trx("invoice_audit_logs").insert({
      company_id: companyId,
      invoice_id: invoiceId,
      action,
      changes: JSON.stringify(changes),
      performed_by: performedBy,
    });
  }

  private resolveSortColumn(sortBy: ListInvoicesQuery["sortBy"]): string {
    const columns: Record<ListInvoicesQuery["sortBy"], string> = {
      due_date: "i.due_date",
      total: "i.total",
      created_at: "i.created_at",
      status: "i.status",
      invoice_number: "i.invoice_number",
    };

    return columns[sortBy];
  }

  private mapToListItem(row: Record<string, unknown>): InvoiceListItem {
    const lineItems = (row.line_items as InvoiceListItem["lineItems"]) ?? [];
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      invoiceNumber: row.invoice_number as string,
      customerName: row.customer_name as string,
      customerEmail: (row.customer_email as string | null) ?? null,
      customerPhone: (row.customer_phone as string | null) ?? null,
      booking: row.booking_id
        ? {
            id: row.booking_id as number,
            uuid: row.booking_uuid as string,
            bookingNumber: row.booking_number as string,
          }
        : null,
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
      lineItems,
      subtotal: Number(row.subtotal),
      taxRate: Number(row.tax_rate),
      taxAmount: Number(row.tax_amount),
      discount: Number(row.discount),
      total: Number(row.total),
      dueDate: row.due_date as string,
      status: row.status as InvoiceListItem["status"],
      notes: (row.notes as string | null) ?? null,
      terms: (row.terms as string | null) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDetail(row: Record<string, unknown>): InvoiceDetail {
    return {
      ...this.mapToListItem(row),
      receiptFileUrl: null,
      receiptOriginalFileName: null,
      receiptMimeType: null,
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
