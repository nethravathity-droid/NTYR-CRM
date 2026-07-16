import type { Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../../common/errors/AppError.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { PaymentsService } from "./payment.service.js";
import {
  createPaymentSchema,
  deletePaymentSchema,
  getPaymentAuditSchema,
  getPaymentSchema,
  listPaymentsSchema,
  schedulePaymentsSchema,
  updatePaymentSchema,
  type CreatePaymentInput,
  type UpdatePaymentInput,
} from "./payment.validation.js";

type ListPaymentsRequest = Request & { validated: z.infer<typeof listPaymentsSchema> };
type SchedulePaymentsRequest = Request & { validated: z.infer<typeof schedulePaymentsSchema> };
type CreatePaymentRequest = Request & { validated: z.infer<typeof createPaymentSchema> };
type GetPaymentRequest = Request & { validated: z.infer<typeof getPaymentSchema> };
type UpdatePaymentRequest = Request & { validated: z.infer<typeof updatePaymentSchema> };
type DeletePaymentRequest = Request & { validated: z.infer<typeof deletePaymentSchema> };
type GetPaymentAuditRequest = Request & { validated: z.infer<typeof getPaymentAuditSchema> };

function parsePaymentBody(body: Record<string, unknown>): CreatePaymentInput | UpdatePaymentInput {
  return {
    bookingId: body.bookingId != null ? Number(body.bookingId) : undefined,
    customerName: body.customerName != null ? String(body.customerName) : undefined,
    projectId: body.projectId != null ? Number(body.projectId) : undefined,
    unitId: body.unitId != null ? Number(body.unitId) : undefined,
    paymentType: body.paymentType as CreatePaymentInput["paymentType"] | undefined,
    amount: body.amount != null ? Number(body.amount) : undefined,
    dueAmount: body.dueAmount != null ? Number(body.dueAmount) : undefined,
    dueDate: body.dueDate != null ? String(body.dueDate) : undefined,
    paymentDate: body.paymentDate === "" || body.paymentDate == null ? null : String(body.paymentDate),
    paymentMode: body.paymentMode === "" || body.paymentMode == null ? null : (body.paymentMode as CreatePaymentInput["paymentMode"]),
    transactionReference: body.transactionReference === "" || body.transactionReference == null ? null : String(body.transactionReference),
    bankName: body.bankName === "" || body.bankName == null ? null : String(body.bankName),
    receiptNumber: body.receiptNumber === "" || body.receiptNumber == null ? null : String(body.receiptNumber),
    status: body.status as CreatePaymentInput["status"] | undefined,
    notes: body.notes === "" || body.notes == null ? null : String(body.notes),
  } as CreatePaymentInput | UpdatePaymentInput;
}

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListPaymentsRequest).validated;
    const result = await this.paymentsService.listPayments(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  });

  getSchedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as SchedulePaymentsRequest).validated;
    const schedule = await this.paymentsService.getSchedule(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Payment schedule retrieved successfully",
      data: { schedule },
    });
  });

  getOutstanding = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const outstanding = await this.paymentsService.getOutstanding(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Outstanding payments retrieved successfully",
      data: { outstanding },
    });
  });

  getOverdue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const overdue = await this.paymentsService.getOverdue(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Overdue payments retrieved successfully",
      data: { overdue },
    });
  });

  getCollectionSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const summary = await this.paymentsService.getCollectionSummary(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Collection summary retrieved successfully",
      data: { summary },
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.paymentsService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Payment form options retrieved successfully",
      data: options,
    });
  });

  getByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetPaymentRequest).validated;
    const payment = await this.paymentsService.getPaymentByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: { payment },
    });
  });

  getAuditTrail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetPaymentAuditRequest).validated;
    const auditTrail = await this.paymentsService.getAuditTrail(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Payment audit trail retrieved successfully",
      data: { auditTrail },
    });
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parsed = createPaymentSchema.shape.body.safeParse(parsePaymentBody(req.body as Record<string, unknown>));
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
    }

    const payment = await this.paymentsService.createPayment(req.user!.companyId, parsed.data, req.user!.id, req.file);

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: { payment },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as UpdatePaymentRequest).validated;
    const parsed = updatePaymentSchema.shape.body.safeParse(parsePaymentBody(req.body as Record<string, unknown>));
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
    }

    const payment = await this.paymentsService.updatePayment(req.user!.companyId, params.uuid, parsed.data, req.user!.id, req.file);

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: { payment },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeletePaymentRequest).validated;
    await this.paymentsService.deletePayment(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  });

  uploadReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetPaymentRequest).validated;
    if (!req.file) {
      throw new AppError(400, "Receipt file is required");
    }

    const payment = await this.paymentsService.uploadReceipt(req.user!.companyId, params.uuid, req.file, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Receipt uploaded successfully",
      data: { payment },
    });
  });
}
