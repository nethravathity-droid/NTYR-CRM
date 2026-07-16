import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { saveUploadedFile } from "../../common/utils/uploads.js";
import { db } from "../../database/knex.js";
import { BookingsRepository } from "./booking.repository.js";
import type { BookingDetail, BookingDocumentItem } from "./booking.types.js";
import type {
  ApproveBookingInput,
  CancelBookingInput,
  CreateBookingInput,
  ListBookingsQuery,
  RejectBookingInput,
  UpdateBookingInput,
  UploadBookingDocumentInput,
} from "./booking.validation.js";

export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly logger: Logger,
  ) {}

  async listBookings(companyId: number, query: ListBookingsQuery) {
    return this.bookingsRepository.listBookings(companyId, query);
  }

  async getBookingByUuid(companyId: number, uuid: string): Promise<BookingDetail> {
    const booking = await this.bookingsRepository.findBookingByUuid(companyId, uuid);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    return booking;
  }

  async getAuditTrail(companyId: number, uuid: string) {
    const booking = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    return this.bookingsRepository.getAuditTrail(companyId, booking.id);
  }

  async createBooking(companyId: number, input: CreateBookingInput, createdBy: number): Promise<BookingDetail> {
    await this.validateRelations(companyId, input);
    const booking = await this.bookingsRepository.createBooking(companyId, input, createdBy);
    this.logger.info("Booking created", { companyId, bookingUuid: booking.uuid });
    return booking;
  }

  async updateBooking(companyId: number, uuid: string, input: UpdateBookingInput, updatedBy: number): Promise<BookingDetail> {
    const existing = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Booking not found");
    }

    if (["APPROVED", "COMPLETED", "CANCELLED"].includes(existing.status) && input.status && input.status !== existing.status) {
      throw new AppError(400, "Cannot change status of a finalized booking");
    }

    await this.validateRelations(companyId, {
      ...input,
      customerName: input.customerName ?? existing.customer_name,
      projectId: input.projectId ?? existing.project_id,
      unitId: input.unitId ?? existing.unit_id,
      bookingDate: input.bookingDate ?? existing.booking_date,
      bookingAmount: input.bookingAmount ?? Number(existing.booking_amount),
      totalUnitPrice: input.totalUnitPrice ?? Number(existing.total_unit_price),
      discountAmount: input.discountAmount ?? Number(existing.discount_amount),
      finalPrice: input.finalPrice ?? Number(existing.final_price),
    });

    const booking = await this.bookingsRepository.updateBooking(companyId, existing.id, input, updatedBy);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    return booking;
  }

  async deleteBooking(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Booking not found");
    }

    const deleted = await this.bookingsRepository.softDeleteBooking(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Booking not found");
    }
  }

  async approveBooking(companyId: number, uuid: string, input: ApproveBookingInput, updatedBy: number): Promise<BookingDetail> {
    const existing = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Booking not found");
    }

    if (!["PENDING_APPROVAL", "DRAFT"].includes(existing.status)) {
      throw new AppError(400, "Only draft or pending approval bookings can be approved");
    }

    const booking = await this.bookingsRepository.approveBooking(companyId, existing.id, input.notes, updatedBy);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    return booking;
  }

  async rejectBooking(companyId: number, uuid: string, input: RejectBookingInput, updatedBy: number): Promise<BookingDetail> {
    const existing = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Booking not found");
    }

    if (existing.status !== "PENDING_APPROVAL") {
      throw new AppError(400, "Only pending approval bookings can be rejected");
    }

    const booking = await this.bookingsRepository.rejectBooking(companyId, existing.id, input.notes, updatedBy);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    return booking;
  }

  async cancelBooking(companyId: number, uuid: string, input: CancelBookingInput, updatedBy: number): Promise<BookingDetail> {
    const existing = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Booking not found");
    }

    if (["CANCELLED", "COMPLETED"].includes(existing.status)) {
      throw new AppError(400, "Booking is already cancelled or completed");
    }

    const booking = await this.bookingsRepository.cancelBooking(companyId, existing.id, input.notes, updatedBy);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    return booking;
  }

  async uploadDocument(
    companyId: number,
    uuid: string,
    input: UploadBookingDocumentInput,
    file: Express.Multer.File,
    uploadedBy: number,
  ): Promise<BookingDocumentItem> {
    const existing = await this.bookingsRepository.findBookingRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Booking not found");
    }

    const relativePath = await saveUploadedFile(file, [
      "companies",
      String(companyId),
      "bookings",
      existing.uuid,
      input.documentType.toLowerCase(),
    ]);

    return this.bookingsRepository.uploadDocument(
      companyId,
      existing.id,
      {
        documentType: input.documentType,
        originalFileName: file.originalname,
        filePath: relativePath,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
      uploadedBy,
    );
  }

  async getFormOptions(companyId: number) {
    return this.bookingsRepository.getFormOptions(companyId);
  }

  private async validateRelations(
    companyId: number,
    input: Partial<CreateBookingInput> & Pick<CreateBookingInput, "customerName" | "projectId" | "unitId" | "bookingDate" | "bookingAmount" | "totalUnitPrice" | "discountAmount" | "finalPrice">,
  ) {
    if (input.leadId) {
      const lead = await db("leads").where({ id: input.leadId, company_id: companyId }).whereNull("deleted_at").first();
      if (!lead) {
        throw new AppError(400, "Invalid lead reference");
      }
    }

    const project = await db("projects").where({ id: input.projectId, company_id: companyId }).whereNull("deleted_at").first();
    if (!project) {
      throw new AppError(400, "Invalid project reference");
    }

    const unit = await db("units").where({ id: input.unitId, company_id: companyId, project_id: input.projectId }).whereNull("deleted_at").first();
    if (!unit) {
      throw new AppError(400, "Invalid unit reference for the selected project");
    }

    if (input.telecallerUserId) {
      const user = await db("users").where({ id: input.telecallerUserId, company_id: companyId, status: "ACTIVE" }).whereNull("deleted_at").first();
      if (!user) {
        throw new AppError(400, "Invalid telecaller reference");
      }
    }

    if (input.salesExecutiveUserId) {
      const user = await db("users").where({ id: input.salesExecutiveUserId, company_id: companyId, status: "ACTIVE" }).whereNull("deleted_at").first();
      if (!user) {
        throw new AppError(400, "Invalid sales executive reference");
      }
    }

    if (input.branchId) {
      const branch = await db("branches").where({ id: input.branchId, company_id: companyId }).whereNull("deleted_at").first();
      if (!branch) {
        throw new AppError(400, "Invalid branch reference");
      }
    }
  }
}

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const bookingsService = new BookingsService(new BookingsRepository(db), logger);
