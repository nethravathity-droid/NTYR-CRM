import type { Knex } from "knex";
import { toPublicUploadPath } from "../../common/utils/uploads.js";
import type {
  CollectionSummary,
  CreatePaymentData,
  PaginatedPayments,
  PaymentAuditEntry,
  PaymentDetail,
  PaymentListItem,
  PaymentRecord,
  UpdatePaymentData,
} from "./payment.types.js";
import type { ListPaymentsQuery, SchedulePaymentsQuery } from "./payment.validation.js";

const PAYMENT_LIST_SELECT = [
  "p.id",
  "p.uuid",
  "p.payment_number",
  "p.customer_name",
  "p.payment_type",
  "p.amount",
  "p.due_amount",
  "p.due_date",
  "p.payment_date",
  "p.payment_mode",
  "p.transaction_reference",
  "p.bank_name",
  "p.receipt_number",
  "p.status",
  "p.notes",
  "p.receipt_file_path",
  "p.receipt_original_file_name",
  "p.receipt_mime_type",
  "p.created_at",
  "p.updated_at",
  "p.created_by",
  "p.updated_by",
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

export class PaymentsRepository {
  constructor(private readonly db: Knex) {}

  async listPayments(companyId: number, query: ListPaymentsQuery): Promise<PaginatedPayments> {
    const baseQuery = this.buildListQuery(companyId, query);
    const countResult = await baseQuery.clone().countDistinct("p.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(PAYMENT_LIST_SELECT)
      .orderBy(this.resolveSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      payments: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async getSchedule(companyId: number, query: SchedulePaymentsQuery): Promise<PaymentListItem[]> {
    const baseQuery = this.buildListQuery(companyId, {
      page: 1,
      limit: 100,
      sortBy: "due_date",
      sortOrder: "asc",
      bookingId: query.bookingId,
      projectId: query.projectId,
      fromDueDate: query.fromDate,
      toDueDate: query.toDate,
    });

    const rows = await baseQuery
      .clone()
      .whereIn("p.status", ["PENDING", "PARTIAL"])
      .select(PAYMENT_LIST_SELECT)
      .orderBy("p.due_date", "asc")
      .limit(500);

    return rows.map((row) => this.mapToListItem(row));
  }

  async getOutstanding(companyId: number): Promise<PaymentListItem[]> {
    const rows = await this.buildListQuery(companyId, { page: 1, limit: 100, sortBy: "due_date", sortOrder: "asc" })
      .clone()
      .whereIn("p.status", ["PENDING", "PARTIAL"])
      .where("p.due_amount", ">", 0)
      .select(PAYMENT_LIST_SELECT)
      .orderBy("p.due_date", "asc")
      .limit(100);

    return rows.map((row) => this.mapToListItem(row));
  }

  async getOverdue(companyId: number): Promise<PaymentListItem[]> {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await this.buildListQuery(companyId, { page: 1, limit: 100, sortBy: "due_date", sortOrder: "asc" })
      .clone()
      .whereIn("p.status", ["PENDING", "PARTIAL", "FAILED"])
      .where("p.due_date", "<", today)
      .where("p.due_amount", ">", 0)
      .select(PAYMENT_LIST_SELECT)
      .orderBy("p.due_date", "asc")
      .limit(100);

    return rows.map((row) => this.mapToListItem(row));
  }

  async getCollectionSummary(companyId: number): Promise<CollectionSummary> {
    const today = new Date().toISOString().slice(0, 10);

    const [aggregates, statusCounts, overdueCount] = await Promise.all([
      this.db("payments")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .select(
          this.db.raw("COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as total_collected"),
          this.db.raw("COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PARTIAL') THEN due_amount ELSE 0 END), 0) as total_outstanding"),
          this.db.raw(`COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PARTIAL', 'FAILED') AND due_date < ? AND due_amount > 0 THEN due_amount ELSE 0 END), 0) as total_overdue`, [today]),
        )
        .first<{ total_collected: string; total_outstanding: string; total_overdue: string }>(),
      this.db("payments")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .groupBy("status")
        .select("status")
        .count("* as count"),
      this.db("payments")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereIn("status", ["PENDING", "PARTIAL", "FAILED"])
        .where("due_date", "<", today)
        .where("due_amount", ">", 0)
        .count("* as count")
        .first<{ count: string }>(),
    ]);

    const countMap = new Map(statusCounts.map((row) => [row.status as string, Number(row.count)]));

    return {
      totalCollected: Number(aggregates?.total_collected ?? 0),
      totalOutstanding: Number(aggregates?.total_outstanding ?? 0),
      totalOverdue: Number(aggregates?.total_overdue ?? 0),
      paidCount: countMap.get("PAID") ?? 0,
      pendingCount: countMap.get("PENDING") ?? 0,
      partialCount: countMap.get("PARTIAL") ?? 0,
      failedCount: countMap.get("FAILED") ?? 0,
      refundedCount: countMap.get("REFUNDED") ?? 0,
      overdueCount: Number(overdueCount?.count ?? 0),
    };
  }

  async findPaymentByUuid(companyId: number, uuid: string): Promise<PaymentDetail | null> {
    const row = await this.buildListQuery(companyId, { page: 1, limit: 1, sortBy: "due_date", sortOrder: "asc" })
      .clone()
      .where("p.uuid", uuid)
      .select(PAYMENT_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  async findPaymentRecordByUuid(companyId: number, uuid: string): Promise<PaymentRecord | null> {
    const record = await this.db<PaymentRecord>("payments")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return record ?? null;
  }

  async createPayment(companyId: number, data: CreatePaymentData, createdBy: number): Promise<PaymentDetail> {
    return this.db.transaction(async (trx) => {
      const paymentNumber = await this.generatePaymentNumber(companyId, trx);

      const [inserted] = await trx("payments")
        .insert({
          company_id: companyId,
          payment_number: paymentNumber,
          booking_id: data.bookingId,
          customer_name: data.customerName,
          project_id: data.projectId,
          unit_id: data.unitId,
          payment_type: data.paymentType,
          amount: data.amount,
          due_amount: data.dueAmount,
          due_date: data.dueDate,
          payment_date: data.paymentDate ?? null,
          payment_mode: data.paymentMode ?? null,
          transaction_reference: data.transactionReference ?? null,
          bank_name: data.bankName ?? null,
          receipt_number: data.receiptNumber ?? null,
          status: data.status ?? "PENDING",
          notes: data.notes ?? null,
          receipt_file_path: data.receiptFilePath ?? null,
          receipt_original_file_name: data.receiptOriginalFileName ?? null,
          receipt_mime_type: data.receiptMimeType ?? null,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning(["id", "uuid"]);

      await this.insertAuditLog(trx, companyId, inserted.id, "CREATED", { paymentNumber }, createdBy);

      const payment = await this.findPaymentByUuidInTrx(trx, companyId, inserted.uuid);
      if (!payment) {
        throw new Error("Failed to retrieve created payment");
      }

      return payment;
    });
  }

  async updatePayment(companyId: number, paymentId: number, data: UpdatePaymentData, updatedBy: number): Promise<PaymentDetail | null> {
    const existing = await this.db<PaymentRecord>("payments")
      .where({ id: paymentId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.bookingId !== undefined) updatePayload.booking_id = data.bookingId;
    if (data.customerName !== undefined) updatePayload.customer_name = data.customerName;
    if (data.projectId !== undefined) updatePayload.project_id = data.projectId;
    if (data.unitId !== undefined) updatePayload.unit_id = data.unitId;
    if (data.paymentType !== undefined) updatePayload.payment_type = data.paymentType;
    if (data.amount !== undefined) updatePayload.amount = data.amount;
    if (data.dueAmount !== undefined) updatePayload.due_amount = data.dueAmount;
    if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;
    if (data.paymentDate !== undefined) updatePayload.payment_date = data.paymentDate;
    if (data.paymentMode !== undefined) updatePayload.payment_mode = data.paymentMode;
    if (data.transactionReference !== undefined) updatePayload.transaction_reference = data.transactionReference;
    if (data.bankName !== undefined) updatePayload.bank_name = data.bankName;
    if (data.receiptNumber !== undefined) updatePayload.receipt_number = data.receiptNumber;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.receiptFilePath !== undefined) updatePayload.receipt_file_path = data.receiptFilePath;
    if (data.receiptOriginalFileName !== undefined) updatePayload.receipt_original_file_name = data.receiptOriginalFileName;
    if (data.receiptMimeType !== undefined) updatePayload.receipt_mime_type = data.receiptMimeType;

    await this.db.transaction(async (trx) => {
      await trx("payments").where({ id: paymentId, company_id: companyId }).update(updatePayload);
      await this.insertAuditLog(trx, companyId, paymentId, "UPDATED", data, updatedBy);
    });

    return this.findPaymentByUuid(companyId, existing.uuid);
  }

  async softDeletePayment(companyId: number, paymentId: number, deletedBy: number): Promise<boolean> {
    const existing = await this.db<PaymentRecord>("payments")
      .where({ id: paymentId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return false;
    }

    await this.db.transaction(async (trx) => {
      await trx("payments")
        .where({ id: paymentId, company_id: companyId })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: deletedBy,
          updated_at: trx.fn.now(),
          updated_by: deletedBy,
        });

      await this.insertAuditLog(trx, companyId, paymentId, "DELETED", { paymentNumber: existing.payment_number }, deletedBy);
    });

    return true;
  }

  async getAuditTrail(companyId: number, paymentId: number): Promise<PaymentAuditEntry[]> {
    const rows = await this.db("payment_audit_logs as al")
      .leftJoin("users as u", "u.id", "al.performed_by")
      .where({ "al.company_id": companyId, "al.payment_id": paymentId })
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
    const [bookings, projects, units] = await Promise.all([
      this.db("bookings")
        .select(
          "id",
          "uuid",
          "booking_number as bookingNumber",
          "customer_name as customerName",
          "project_id as projectId",
          "unit_id as unitId",
          "final_price as finalPrice",
        )
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereIn("status", ["APPROVED", "COMPLETED"])
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
      paymentTypes: ["BOOKING_AMOUNT", "DOWN_PAYMENT", "INSTALLMENT", "PLC", "REGISTRATION", "OTHER"],
      paymentModes: ["CASH", "UPI", "NEFT", "RTGS", "CHEQUE", "CARD"],
      statuses: ["PENDING", "PAID", "PARTIAL", "FAILED", "REFUNDED"],
    };
  }

  private buildListQuery(companyId: number, query: Partial<ListPaymentsQuery>) {
    const baseQuery = this.db("payments as p")
      .join("bookings as b", "b.id", "p.booking_id")
      .join("projects as pr", "pr.id", "p.project_id")
      .join("units as u", "u.id", "p.unit_id")
      .where("p.company_id", companyId)
      .whereNull("p.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("p.customer_name", term)
          .orWhereILike("p.payment_number", term)
          .orWhereILike("b.booking_number", term)
          .orWhereILike("p.receipt_number", term)
          .orWhereILike("p.transaction_reference", term)
          .orWhereILike("pr.project_name", term);
      });
    }

    if (query.status) baseQuery.where("p.status", query.status);
    if (query.paymentType) baseQuery.where("p.payment_type", query.paymentType);
    if (query.paymentMode) baseQuery.where("p.payment_mode", query.paymentMode);
    if (query.bookingId) baseQuery.where("p.booking_id", query.bookingId);
    if (query.projectId) baseQuery.where("p.project_id", query.projectId);
    if (query.unitId) baseQuery.where("p.unit_id", query.unitId);
    if (query.fromDueDate) baseQuery.where("p.due_date", ">=", query.fromDueDate);
    if (query.toDueDate) baseQuery.where("p.due_date", "<=", query.toDueDate);
    if (query.fromPaymentDate) baseQuery.where("p.payment_date", ">=", query.fromPaymentDate);
    if (query.toPaymentDate) baseQuery.where("p.payment_date", "<=", query.toPaymentDate);

    return baseQuery;
  }

  private async findPaymentByUuidInTrx(trx: Knex.Transaction, companyId: number, uuid: string): Promise<PaymentDetail | null> {
    const row = await trx("payments as p")
      .join("bookings as b", "b.id", "p.booking_id")
      .join("projects as pr", "pr.id", "p.project_id")
      .join("units as u", "u.id", "p.unit_id")
      .where("p.company_id", companyId)
      .where("p.uuid", uuid)
      .whereNull("p.deleted_at")
      .select(PAYMENT_LIST_SELECT)
      .first();

    return row ? this.mapToDetail(row) : null;
  }

  private async generatePaymentNumber(companyId: number, trx: Knex.Transaction): Promise<string> {
    const last = await trx("payments")
      .where({ company_id: companyId })
      .orderBy("id", "desc")
      .select("payment_number")
      .forUpdate()
      .first<{ payment_number: string }>();

    let next = 1;
    if (last?.payment_number) {
      const match = last.payment_number.match(/(\d+)$/);
      if (match?.[1]) {
        next = Number.parseInt(match[1], 10) + 1;
      }
    }

    return `PM-${String(next).padStart(6, "0")}`;
  }

  private async insertAuditLog(
    trx: Knex | Knex.Transaction,
    companyId: number,
    paymentId: number,
    action: string,
    changes: Record<string, unknown>,
    performedBy: number,
  ): Promise<void> {
    await trx("payment_audit_logs").insert({
      company_id: companyId,
      payment_id: paymentId,
      action,
      changes: JSON.stringify(changes),
      performed_by: performedBy,
    });
  }

  private resolveSortColumn(sortBy: ListPaymentsQuery["sortBy"]): string {
    const columns: Record<ListPaymentsQuery["sortBy"], string> = {
      due_date: "p.due_date",
      payment_date: "p.payment_date",
      amount: "p.amount",
      customer_name: "p.customer_name",
      created_at: "p.created_at",
      status: "p.status",
    };

    return columns[sortBy];
  }

  private mapToListItem(row: Record<string, unknown>): PaymentListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      paymentNumber: row.payment_number as string,
      booking: {
        id: row.booking_id as number,
        uuid: row.booking_uuid as string,
        bookingNumber: row.booking_number as string,
      },
      customerName: row.customer_name as string,
      project: {
        id: row.project_id as number,
        uuid: row.project_uuid as string,
        projectName: row.project_name as string,
        projectCode: row.project_code as string,
      },
      unit: {
        id: row.unit_id as number,
        uuid: row.unit_uuid as string,
        unitNumber: row.unit_number as string,
      },
      paymentType: row.payment_type as PaymentListItem["paymentType"],
      amount: Number(row.amount),
      dueAmount: Number(row.due_amount),
      dueDate: row.due_date as string,
      paymentDate: (row.payment_date as string | null) ?? null,
      paymentMode: (row.payment_mode as PaymentListItem["paymentMode"]) ?? null,
      transactionReference: (row.transaction_reference as string | null) ?? null,
      bankName: (row.bank_name as string | null) ?? null,
      receiptNumber: (row.receipt_number as string | null) ?? null,
      status: row.status as PaymentListItem["status"],
      notes: (row.notes as string | null) ?? null,
      hasReceipt: Boolean(row.receipt_file_path),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDetail(row: Record<string, unknown>): PaymentDetail {
    const receiptPath = row.receipt_file_path as string | null;
    return {
      ...this.mapToListItem(row),
      receiptFileUrl: receiptPath ? toPublicUploadPath(receiptPath) : null,
      receiptOriginalFileName: (row.receipt_original_file_name as string | null) ?? null,
      receiptMimeType: (row.receipt_mime_type as string | null) ?? null,
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
