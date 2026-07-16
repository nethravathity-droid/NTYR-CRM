import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { saveUploadedFile } from "../../common/utils/uploads.js";
import { db } from "../../database/knex.js";
import { PaymentsRepository } from "./payment.repository.js";
import type { PaymentDetail } from "./payment.types.js";
import type { CreatePaymentInput, ListPaymentsQuery, SchedulePaymentsQuery, UpdatePaymentInput } from "./payment.validation.js";

export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly logger: Logger,
  ) {}

  async listPayments(companyId: number, query: ListPaymentsQuery) {
    return this.paymentsRepository.listPayments(companyId, query);
  }

  async getSchedule(companyId: number, query: SchedulePaymentsQuery) {
    return this.paymentsRepository.getSchedule(companyId, query);
  }

  async getOutstanding(companyId: number) {
    return this.paymentsRepository.getOutstanding(companyId);
  }

  async getOverdue(companyId: number) {
    return this.paymentsRepository.getOverdue(companyId);
  }

  async getCollectionSummary(companyId: number) {
    return this.paymentsRepository.getCollectionSummary(companyId);
  }

  async getPaymentByUuid(companyId: number, uuid: string): Promise<PaymentDetail> {
    const payment = await this.paymentsRepository.findPaymentByUuid(companyId, uuid);
    if (!payment) {
      throw new AppError(404, "Payment not found");
    }
    return payment;
  }

  async getAuditTrail(companyId: number, uuid: string) {
    const payment = await this.paymentsRepository.findPaymentRecordByUuid(companyId, uuid);
    if (!payment) {
      throw new AppError(404, "Payment not found");
    }
    return this.paymentsRepository.getAuditTrail(companyId, payment.id);
  }

  async createPayment(companyId: number, input: CreatePaymentInput, createdBy: number, receiptFile?: Express.Multer.File): Promise<PaymentDetail> {
    await this.validateRelations(companyId, input);
    const receiptMeta = receiptFile ? await this.persistReceipt(companyId, receiptFile) : null;

    const payment = await this.paymentsRepository.createPayment(
      companyId,
      {
        ...input,
        ...receiptMeta,
      },
      createdBy,
    );

    this.logger.info("Payment created", { companyId, paymentUuid: payment.uuid });
    return payment;
  }

  async updatePayment(
    companyId: number,
    uuid: string,
    input: UpdatePaymentInput,
    updatedBy: number,
    receiptFile?: Express.Multer.File,
  ): Promise<PaymentDetail> {
    const existing = await this.paymentsRepository.findPaymentRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Payment not found");
    }

    await this.validateRelations(companyId, {
      ...input,
      bookingId: input.bookingId ?? existing.booking_id,
      customerName: input.customerName ?? existing.customer_name,
      projectId: input.projectId ?? existing.project_id,
      unitId: input.unitId ?? existing.unit_id,
      paymentType: input.paymentType ?? existing.payment_type,
      amount: input.amount ?? Number(existing.amount),
      dueAmount: input.dueAmount ?? Number(existing.due_amount),
      dueDate: input.dueDate ?? existing.due_date,
    });

    const receiptMeta = receiptFile ? await this.persistReceipt(companyId, receiptFile, existing.uuid) : null;

    const payment = await this.paymentsRepository.updatePayment(
      companyId,
      existing.id,
      {
        ...input,
        ...receiptMeta,
      },
      updatedBy,
    );

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }
    return payment;
  }

  async deletePayment(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.paymentsRepository.findPaymentRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Payment not found");
    }

    const deleted = await this.paymentsRepository.softDeletePayment(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Payment not found");
    }
  }

  async uploadReceipt(companyId: number, uuid: string, file: Express.Multer.File, updatedBy: number): Promise<PaymentDetail> {
    const existing = await this.paymentsRepository.findPaymentRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Payment not found");
    }

    const receiptMeta = await this.persistReceipt(companyId, file, existing.uuid);
    const payment = await this.paymentsRepository.updatePayment(companyId, existing.id, receiptMeta, updatedBy);

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }
    return payment;
  }

  async getFormOptions(companyId: number) {
    return this.paymentsRepository.getFormOptions(companyId);
  }

  private async persistReceipt(companyId: number, file: Express.Multer.File, paymentUuid?: string) {
    const relativePath = await saveUploadedFile(file, [
      "companies",
      String(companyId),
      "payments",
      paymentUuid ?? "new",
      "receipts",
    ]);

    return {
      receiptFilePath: relativePath,
      receiptOriginalFileName: file.originalname,
      receiptMimeType: file.mimetype,
    };
  }

  private async validateRelations(
    companyId: number,
    input: Partial<CreatePaymentInput> & Pick<CreatePaymentInput, "bookingId" | "customerName" | "projectId" | "unitId" | "paymentType" | "amount" | "dueAmount" | "dueDate">,
  ) {
    const booking = await db("bookings")
      .where({ id: input.bookingId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!booking) {
      throw new AppError(400, "Invalid booking reference");
    }

    if (booking.project_id !== input.projectId || booking.unit_id !== input.unitId) {
      throw new AppError(400, "Project and unit must match the selected booking");
    }

    const project = await db("projects").where({ id: input.projectId, company_id: companyId }).whereNull("deleted_at").first();
    if (!project) {
      throw new AppError(400, "Invalid project reference");
    }

    const unit = await db("units").where({ id: input.unitId, company_id: companyId, project_id: input.projectId }).whereNull("deleted_at").first();
    if (!unit) {
      throw new AppError(400, "Invalid unit reference");
    }
  }
}

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const paymentsService = new PaymentsService(new PaymentsRepository(db), logger);
