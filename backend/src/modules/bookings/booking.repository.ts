import type { Knex } from "knex";
import { toPublicUploadPath } from "../../common/utils/uploads.js";
import type {
  BookingAuditEntry,
  BookingDetail,
  BookingDocumentItem,
  BookingListItem,
  BookingRecord,
  CreateBookingData,
  PaginatedBookings,
  UpdateBookingData,
  UploadBookingDocumentData,
} from "./booking.types.js";
import type { ListBookingsQuery } from "./booking.validation.js";

const BOOKING_LIST_SELECT = [
  "b.id",
  "b.uuid",
  "b.booking_number",
  "b.customer_name",
  "b.booking_date",
  "b.booking_amount",
  "b.total_unit_price",
  "b.discount_amount",
  "b.final_price",
  "b.payment_plan",
  "b.status",
  "b.notes",
  "b.approval_notes",
  "b.approved_at",
  "b.rejected_at",
  "b.cancelled_at",
  "b.completed_at",
  "b.created_at",
  "b.updated_at",
  "b.created_by",
  "b.updated_by",
  "l.id as lead_id",
  "l.uuid as lead_uuid",
  "l.lead_number",
  "l.customer_name as lead_customer_name",
  "p.id as project_id",
  "p.uuid as project_uuid",
  "p.project_name",
  "p.project_code",
  "u.id as unit_id",
  "u.uuid as unit_uuid",
  "u.unit_number",
  "tc.id as telecaller_id",
  "tc.uuid as telecaller_uuid",
  "tc.employee_code as telecaller_employee_code",
  "tc.display_name as telecaller_display_name",
  "se.id as sales_executive_id",
  "se.uuid as sales_executive_uuid",
  "se.employee_code as sales_executive_employee_code",
  "se.display_name as sales_executive_display_name",
  "br.id as branch_id",
  "br.uuid as branch_uuid",
  "br.branch_name",
  "br.branch_code",
] as const;

export class BookingsRepository {
  constructor(private readonly db: Knex) {}

  async listBookings(companyId: number, query: ListBookingsQuery): Promise<PaginatedBookings> {
    const baseQuery = this.buildListQuery(companyId, query);
    const countResult = await baseQuery.clone().countDistinct("b.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(BOOKING_LIST_SELECT)
      .orderBy(this.resolveSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      bookings: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findBookingByUuid(companyId: number, uuid: string): Promise<BookingDetail | null> {
    const row = await this.buildListQuery(companyId, { page: 1, limit: 1, sortBy: "booking_date", sortOrder: "desc" })
      .clone()
      .where("b.uuid", uuid)
      .select(BOOKING_LIST_SELECT)
      .first();

    if (!row) {
      return null;
    }

    const documents = await this.listDocuments(companyId, row.id as number);
    return this.mapToDetail(row, documents);
  }

  async findBookingRecordByUuid(companyId: number, uuid: string): Promise<BookingRecord | null> {
    const record = await this.db<BookingRecord>("bookings")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return record ?? null;
  }

  async createBooking(companyId: number, data: CreateBookingData, createdBy: number): Promise<BookingDetail> {
    return this.db.transaction(async (trx) => {
      const bookingNumber = await this.generateBookingNumber(companyId, trx);

      const [inserted] = await trx("bookings")
        .insert({
          company_id: companyId,
          booking_number: bookingNumber,
          lead_id: data.leadId ?? null,
          customer_name: data.customerName,
          project_id: data.projectId,
          unit_id: data.unitId,
          booking_date: data.bookingDate,
          booking_amount: data.bookingAmount,
          total_unit_price: data.totalUnitPrice,
          discount_amount: data.discountAmount,
          final_price: data.finalPrice,
          payment_plan: data.paymentPlan ?? null,
          status: data.status ?? "DRAFT",
          telecaller_user_id: data.telecallerUserId ?? null,
          sales_executive_user_id: data.salesExecutiveUserId ?? null,
          branch_id: data.branchId ?? null,
          notes: data.notes ?? null,
          created_by: createdBy,
          updated_by: createdBy,
        })
        .returning(["id", "uuid"]);

      await this.insertAuditLog(trx, companyId, inserted.id, "CREATED", { bookingNumber }, createdBy);

      const booking = await this.findBookingByUuidInTrx(trx, companyId, inserted.uuid);
      if (!booking) {
        throw new Error("Failed to retrieve created booking");
      }

      return booking;
    });
  }

  async updateBooking(companyId: number, bookingId: number, data: UpdateBookingData, updatedBy: number): Promise<BookingDetail | null> {
    const existing = await this.db<BookingRecord>("bookings")
      .where({ id: bookingId, company_id: companyId })
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
    if (data.projectId !== undefined) updatePayload.project_id = data.projectId;
    if (data.unitId !== undefined) updatePayload.unit_id = data.unitId;
    if (data.bookingDate !== undefined) updatePayload.booking_date = data.bookingDate;
    if (data.bookingAmount !== undefined) updatePayload.booking_amount = data.bookingAmount;
    if (data.totalUnitPrice !== undefined) updatePayload.total_unit_price = data.totalUnitPrice;
    if (data.discountAmount !== undefined) updatePayload.discount_amount = data.discountAmount;
    if (data.finalPrice !== undefined) updatePayload.final_price = data.finalPrice;
    if (data.paymentPlan !== undefined) updatePayload.payment_plan = data.paymentPlan;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.telecallerUserId !== undefined) updatePayload.telecaller_user_id = data.telecallerUserId;
    if (data.salesExecutiveUserId !== undefined) updatePayload.sales_executive_user_id = data.salesExecutiveUserId;
    if (data.branchId !== undefined) updatePayload.branch_id = data.branchId;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    await this.db.transaction(async (trx) => {
      await trx("bookings").where({ id: bookingId, company_id: companyId }).update(updatePayload);
      await this.insertAuditLog(trx, companyId, bookingId, "UPDATED", data, updatedBy);
    });

    return this.findBookingByUuid(companyId, existing.uuid);
  }

  async softDeleteBooking(companyId: number, bookingId: number, deletedBy: number): Promise<boolean> {
    const existing = await this.db<BookingRecord>("bookings")
      .where({ id: bookingId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return false;
    }

    await this.db.transaction(async (trx) => {
      await trx("bookings")
        .where({ id: bookingId, company_id: companyId })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: deletedBy,
          updated_at: trx.fn.now(),
          updated_by: deletedBy,
        });

      await this.insertAuditLog(trx, companyId, bookingId, "DELETED", { bookingNumber: existing.booking_number }, deletedBy);
    });

    return true;
  }

  async approveBooking(companyId: number, bookingId: number, notes: string | null | undefined, updatedBy: number): Promise<BookingDetail | null> {
    const existing = await this.db<BookingRecord>("bookings")
      .where({ id: bookingId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    await this.db.transaction(async (trx) => {
      await trx("bookings")
        .where({ id: bookingId, company_id: companyId })
        .update({
          status: "APPROVED",
          approval_notes: notes ?? null,
          approved_at: trx.fn.now(),
          updated_at: trx.fn.now(),
          updated_by: updatedBy,
        });

      await trx("units")
        .where({ id: existing.unit_id, company_id: companyId })
        .whereNull("deleted_at")
        .update({ availability: "BOOKED", updated_at: trx.fn.now(), updated_by: updatedBy });

      await this.insertAuditLog(trx, companyId, bookingId, "APPROVED", { notes: notes ?? null }, updatedBy);
    });

    return this.findBookingByUuid(companyId, existing.uuid);
  }

  async rejectBooking(companyId: number, bookingId: number, notes: string, updatedBy: number): Promise<BookingDetail | null> {
    const existing = await this.db<BookingRecord>("bookings")
      .where({ id: bookingId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    await this.db.transaction(async (trx) => {
      await trx("bookings")
        .where({ id: bookingId, company_id: companyId })
        .update({
          status: "REJECTED",
          approval_notes: notes,
          rejected_at: trx.fn.now(),
          updated_at: trx.fn.now(),
          updated_by: updatedBy,
        });

      await this.insertAuditLog(trx, companyId, bookingId, "REJECTED", { notes }, updatedBy);
    });

    return this.findBookingByUuid(companyId, existing.uuid);
  }

  async cancelBooking(companyId: number, bookingId: number, notes: string | null | undefined, updatedBy: number): Promise<BookingDetail | null> {
    const existing = await this.db<BookingRecord>("bookings")
      .where({ id: bookingId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    await this.db.transaction(async (trx) => {
      await trx("bookings")
        .where({ id: bookingId, company_id: companyId })
        .update({
          status: "CANCELLED",
          approval_notes: notes ?? existing.approval_notes,
          cancelled_at: trx.fn.now(),
          updated_at: trx.fn.now(),
          updated_by: updatedBy,
        });

      if (existing.status === "APPROVED") {
        await trx("units")
          .where({ id: existing.unit_id, company_id: companyId })
          .whereNull("deleted_at")
          .where("availability", "BOOKED")
          .update({ availability: "AVAILABLE", updated_at: trx.fn.now(), updated_by: updatedBy });
      }

      await this.insertAuditLog(trx, companyId, bookingId, "CANCELLED", { notes: notes ?? null }, updatedBy);
    });

    return this.findBookingByUuid(companyId, existing.uuid);
  }

  async uploadDocument(
    companyId: number,
    bookingId: number,
    data: UploadBookingDocumentData,
    uploadedBy: number,
  ): Promise<BookingDocumentItem> {
    return this.db.transaction(async (trx) => {
      const existing = await trx("booking_documents")
        .where({ company_id: companyId, booking_id: bookingId, document_type: data.documentType })
        .whereNull("deleted_at")
        .first();

      if (existing) {
        await trx("booking_documents")
          .where({ id: existing.id })
          .update({
            deleted_at: trx.fn.now(),
            deleted_by: uploadedBy,
          });
      }

      const [inserted] = await trx("booking_documents")
        .insert({
          company_id: companyId,
          booking_id: bookingId,
          document_type: data.documentType,
          original_file_name: data.originalFileName,
          file_path: data.filePath,
          mime_type: data.mimeType ?? null,
          file_size: data.fileSize ?? null,
          uploaded_by: uploadedBy,
        })
        .returning(["id", "uuid", "document_type", "original_file_name", "file_path", "mime_type", "file_size", "uploaded_by", "created_at"]);

      await this.insertAuditLog(trx, companyId, bookingId, "DOCUMENT_UPLOADED", { documentType: data.documentType }, uploadedBy);

      return this.mapDocument(inserted);
    });
  }

  async listDocuments(companyId: number, bookingId: number): Promise<BookingDocumentItem[]> {
    const rows = await this.db("booking_documents")
      .where({ company_id: companyId, booking_id: bookingId })
      .whereNull("deleted_at")
      .orderBy("created_at", "asc");

    return rows.map((row) => this.mapDocument(row));
  }

  async getAuditTrail(companyId: number, bookingId: number): Promise<BookingAuditEntry[]> {
    const rows = await this.db("booking_audit_logs as al")
      .leftJoin("users as u", "u.id", "al.performed_by")
      .where({ "al.company_id": companyId, "al.booking_id": bookingId })
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
    const [leads, projects, units, users, branches] = await Promise.all([
      this.db("leads")
        .select("id", "uuid", "lead_number as leadNumber", "customer_name as customerName")
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
        .select("id", "uuid", "project_id as projectId", "unit_number as unitNumber", "price", "availability")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("unit_number", "asc")
        .limit(2000),
      this.db("users")
        .select("id", "uuid", "employee_code as employeeCode", "display_name as displayName")
        .where({ company_id: companyId, status: "ACTIVE" })
        .whereNull("deleted_at")
        .orderBy("display_name", "asc"),
      this.db("branches")
        .select("id", "uuid", "branch_name as branchName", "branch_code as branchCode")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("branch_name", "asc"),
    ]);

    return {
      leads,
      projects,
      units,
      users,
      branches,
      statuses: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"],
      documentTypes: ["AADHAAR", "PAN", "PASSPORT", "ADDRESS_PROOF", "PHOTOGRAPH", "BOOKING_FORM", "AGREEMENT_COPY"],
    };
  }

  private buildListQuery(companyId: number, query: Partial<ListBookingsQuery>) {
    const baseQuery = this.db("bookings as b")
      .leftJoin("leads as l", "l.id", "b.lead_id")
      .join("projects as p", "p.id", "b.project_id")
      .join("units as u", "u.id", "b.unit_id")
      .leftJoin("users as tc", "tc.id", "b.telecaller_user_id")
      .leftJoin("users as se", "se.id", "b.sales_executive_user_id")
      .leftJoin("branches as br", "br.id", "b.branch_id")
      .where("b.company_id", companyId)
      .whereNull("b.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("b.customer_name", term)
          .orWhereILike("b.booking_number", term)
          .orWhereILike("l.lead_number", term)
          .orWhereILike("p.project_name", term)
          .orWhereILike("u.unit_number", term);
      });
    }

    if (query.status) baseQuery.where("b.status", query.status);
    if (query.projectId) baseQuery.where("b.project_id", query.projectId);
    if (query.unitId) baseQuery.where("b.unit_id", query.unitId);
    if (query.branchId) baseQuery.where("b.branch_id", query.branchId);
    if (query.salesExecutiveUserId) baseQuery.where("b.sales_executive_user_id", query.salesExecutiveUserId);
    if (query.fromDate) baseQuery.where("b.booking_date", ">=", query.fromDate);
    if (query.toDate) baseQuery.where("b.booking_date", "<=", query.toDate);

    return baseQuery;
  }

  private async findBookingByUuidInTrx(trx: Knex.Transaction, companyId: number, uuid: string): Promise<BookingDetail | null> {
    const row = await trx("bookings as b")
      .leftJoin("leads as l", "l.id", "b.lead_id")
      .join("projects as p", "p.id", "b.project_id")
      .join("units as u", "u.id", "b.unit_id")
      .leftJoin("users as tc", "tc.id", "b.telecaller_user_id")
      .leftJoin("users as se", "se.id", "b.sales_executive_user_id")
      .leftJoin("branches as br", "br.id", "b.branch_id")
      .where("b.company_id", companyId)
      .where("b.uuid", uuid)
      .whereNull("b.deleted_at")
      .select(BOOKING_LIST_SELECT)
      .first();

    if (!row) {
      return null;
    }

    const documents = await trx("booking_documents")
      .where({ company_id: companyId, booking_id: row.id as number })
      .whereNull("deleted_at")
      .orderBy("created_at", "asc");

    return this.mapToDetail(row, documents.map((document) => this.mapDocument(document)));
  }

  private async generateBookingNumber(companyId: number, trx: Knex.Transaction): Promise<string> {
    const last = await trx("bookings")
      .where({ company_id: companyId })
      .orderBy("id", "desc")
      .select("booking_number")
      .forUpdate()
      .first<{ booking_number: string }>();

    let next = 1;
    if (last?.booking_number) {
      const match = last.booking_number.match(/(\d+)$/);
      if (match?.[1]) {
        next = Number.parseInt(match[1], 10) + 1;
      }
    }

    return `BK-${String(next).padStart(6, "0")}`;
  }

  private async insertAuditLog(
    trx: Knex | Knex.Transaction,
    companyId: number,
    bookingId: number,
    action: string,
    changes: Record<string, unknown>,
    performedBy: number,
  ): Promise<void> {
    await trx("booking_audit_logs").insert({
      company_id: companyId,
      booking_id: bookingId,
      action,
      changes: JSON.stringify(changes),
      performed_by: performedBy,
    });
  }

  private resolveSortColumn(sortBy: ListBookingsQuery["sortBy"]): string {
    const columns: Record<ListBookingsQuery["sortBy"], string> = {
      booking_date: "b.booking_date",
      customer_name: "b.customer_name",
      created_at: "b.created_at",
      status: "b.status",
      final_price: "b.final_price",
    };

    return columns[sortBy];
  }

  private mapDocument(row: Record<string, unknown>): BookingDocumentItem {
    const filePath = row.file_path as string;
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      documentType: row.document_type as BookingDocumentItem["documentType"],
      originalFileName: row.original_file_name as string,
      fileUrl: toPublicUploadPath(filePath),
      mimeType: (row.mime_type as string | null) ?? null,
      fileSize: row.file_size != null ? Number(row.file_size) : null,
      uploadedBy: (row.uploaded_by as number | null) ?? null,
      createdAt: row.created_at as string,
    };
  }

  private mapToListItem(row: Record<string, unknown>): BookingListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      bookingNumber: row.booking_number as string,
      lead: row.lead_id
        ? {
            id: row.lead_id as number,
            uuid: row.lead_uuid as string,
            leadNumber: row.lead_number as string,
            customerName: row.lead_customer_name as string,
          }
        : null,
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
      bookingDate: row.booking_date as string,
      bookingAmount: Number(row.booking_amount),
      totalUnitPrice: Number(row.total_unit_price),
      discountAmount: Number(row.discount_amount),
      finalPrice: Number(row.final_price),
      paymentPlan: (row.payment_plan as string | null) ?? null,
      status: row.status as BookingListItem["status"],
      telecaller: row.telecaller_id
        ? {
            id: row.telecaller_id as number,
            uuid: row.telecaller_uuid as string,
            employeeCode: row.telecaller_employee_code as string,
            displayName: (row.telecaller_display_name as string | null) ?? null,
          }
        : null,
      salesExecutive: row.sales_executive_id
        ? {
            id: row.sales_executive_id as number,
            uuid: row.sales_executive_uuid as string,
            employeeCode: row.sales_executive_employee_code as string,
            displayName: (row.sales_executive_display_name as string | null) ?? null,
          }
        : null,
      branch: row.branch_id
        ? {
            id: row.branch_id as number,
            uuid: row.branch_uuid as string,
            branchName: row.branch_name as string,
            branchCode: row.branch_code as string,
          }
        : null,
      notes: (row.notes as string | null) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDetail(row: Record<string, unknown>, documents: BookingDocumentItem[]): BookingDetail {
    return {
      ...this.mapToListItem(row),
      approvalNotes: (row.approval_notes as string | null) ?? null,
      approvedAt: (row.approved_at as string | null) ?? null,
      rejectedAt: (row.rejected_at as string | null) ?? null,
      cancelledAt: (row.cancelled_at as string | null) ?? null,
      completedAt: (row.completed_at as string | null) ?? null,
      documents,
      createdBy: (row.created_by as number | null) ?? null,
      updatedBy: (row.updated_by as number | null) ?? null,
    };
  }
}
