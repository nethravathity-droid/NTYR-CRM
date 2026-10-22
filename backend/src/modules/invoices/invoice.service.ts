import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../database/knex.js";
import { InvoicesRepository } from "./invoice.repository.js";
import type { InvoiceDetail } from "./invoice.types.js";
import type { CreateInvoiceInput, ListInvoicesQuery, UpdateInvoiceInput } from "./invoice.validation.js";

export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly logger: Logger,
  ) {}

  async listInvoices(companyId: number, query: ListInvoicesQuery) {
    return this.invoicesRepository.listInvoices(companyId, query);
  }

  async getInvoiceByUuid(companyId: number, uuid: string): Promise<InvoiceDetail> {
    const invoice = await this.invoicesRepository.findInvoiceByUuid(companyId, uuid);
    if (!invoice) {
      throw new AppError(404, "Invoice not found");
    }
    return invoice;
  }

  async getAuditTrail(companyId: number, uuid: string) {
    const invoice = await this.invoicesRepository.findInvoiceRecordByUuid(companyId, uuid);
    if (!invoice) {
      throw new AppError(404, "Invoice not found");
    }
    return this.invoicesRepository.getAuditTrail(companyId, invoice.id);
  }

  async createInvoice(companyId: number, input: CreateInvoiceInput, createdBy: number): Promise<InvoiceDetail> {
    await this.validateRelations(companyId, input);

    const calculatedTotal = this.calculateTotal(input.subtotal, input.taxRate ?? 0, input.discount ?? 0);
    if (Math.abs(calculatedTotal - input.total) > 0.01) {
      throw new AppError(400, "Invoice total does not match calculated amount");
    }

    const invoice = await this.invoicesRepository.createInvoice(companyId, input, createdBy);
    this.logger.info("Invoice created", { companyId, invoiceUuid: invoice.uuid });
    return invoice;
  }

  async updateInvoice(companyId: number, uuid: string, input: UpdateInvoiceInput, updatedBy: number): Promise<InvoiceDetail> {
    const existing = await this.invoicesRepository.findInvoiceRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Invoice not found");
    }

    if (input.lineItems || input.subtotal || input.taxRate || input.discount || input.total) {
      const subtotal = input.subtotal ?? Number(existing.subtotal);
      const taxRate = input.taxRate ?? Number(existing.tax_rate);
      const discount = input.discount ?? Number(existing.discount);
      const total = input.total ?? Number(existing.total);

      const calculatedTotal = this.calculateTotal(subtotal, taxRate, discount);
      if (Math.abs(calculatedTotal - total) > 0.01) {
        throw new AppError(400, "Invoice total does not match calculated amount");
      }
    }

    const invoice = await this.invoicesRepository.updateInvoice(companyId, existing.id, input, updatedBy);
    if (!invoice) {
      throw new AppError(404, "Invoice not found");
    }

    this.logger.info("Invoice updated", { companyId, invoiceUuid: invoice.uuid });
    return invoice;
  }

  async deleteInvoice(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.invoicesRepository.findInvoiceRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Invoice not found");
    }

    const deleted = await this.invoicesRepository.softDeleteInvoice(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Invoice not found");
    }
  }

  async getFormOptions(companyId: number) {
    return this.invoicesRepository.getFormOptions(companyId);
  }

  private calculateTotal(subtotal: number, taxRate: number, discount: number): number {
    const taxAmount = (subtotal * taxRate) / 100;
    return Math.max(0, subtotal + taxAmount - discount);
  }

  private async validateRelations(companyId: number, input: Partial<CreateInvoiceInput>) {
    if (input.bookingId) {
      const booking = await db("bookings")
        .where({ id: input.bookingId, company_id: companyId })
        .whereNull("deleted_at")
        .first();

      if (!booking) {
        throw new AppError(400, "Invalid booking reference");
      }

      if (input.projectId && booking.project_id !== input.projectId) {
        throw new AppError(400, "Booking project mismatch");
      }

      if (input.unitId && booking.unit_id !== input.unitId) {
        throw new AppError(400, "Booking unit mismatch");
      }
    }

    if (input.projectId) {
      const project = await db("projects")
        .where({ id: input.projectId, company_id: companyId })
        .whereNull("deleted_at")
        .first();

      if (!project) {
        throw new AppError(400, "Invalid project reference");
      }
    }

    if (input.unitId) {
      const unit = await db("units")
        .where({ id: input.unitId, company_id: companyId, project_id: input.projectId })
        .whereNull("deleted_at")
        .first();

      if (!unit) {
        throw new AppError(400, "Invalid unit reference");
      }
    }
  }
}

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const invoicesService = new InvoicesService(new InvoicesRepository(db), logger);
