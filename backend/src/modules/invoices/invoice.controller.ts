import type { Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../../common/errors/AppError.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { InvoicesService } from "./invoice.service.js";
import {
  createInvoiceSchema,
  deleteInvoiceSchema,
  getInvoiceAuditSchema,
  getInvoiceSchema,
  listInvoicesSchema,
  updateInvoiceSchema,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
} from "./invoice.validation.js";

type ListInvoicesRequest = Request & { validated: z.infer<typeof listInvoicesSchema> };
type CreateInvoiceRequest = Request & { validated: z.infer<typeof createInvoiceSchema> };
type GetInvoiceRequest = Request & { validated: z.infer<typeof getInvoiceSchema> };
type UpdateInvoiceRequest = Request & { validated: z.infer<typeof updateInvoiceSchema> };
type DeleteInvoiceRequest = Request & { validated: z.infer<typeof deleteInvoiceSchema> };
type GetInvoiceAuditRequest = Request & { validated: z.infer<typeof getInvoiceAuditSchema> };

function parseInvoiceBody(body: Record<string, unknown>): CreateInvoiceInput | UpdateInvoiceInput {
  const lineItems = Array.isArray(body.lineItems)
    ? body.lineItems.map((item) => ({
        description: String(item.description ?? ""),
        quantity: Number(item.quantity ?? 1),
        rate: Number(item.rate ?? 0),
        amount: Number(item.amount ?? 0),
      }))
    : undefined;

  return {
    customerName: body.customerName != null ? String(body.customerName) : undefined,
    customerEmail: body.customerEmail === "" || body.customerEmail == null ? null : String(body.customerEmail),
    customerPhone: body.customerPhone === "" || body.customerPhone == null ? null : String(body.customerPhone),
    customerAddress: body.customerAddress === "" || body.customerAddress == null ? null : String(body.customerAddress),
    bookingId: body.bookingId === "" || body.bookingId == null ? null : Number(body.bookingId),
    projectId: body.projectId === "" || body.projectId == null ? null : Number(body.projectId),
    unitId: body.unitId === "" || body.unitId == null ? null : Number(body.unitId),
    lineItems: lineItems as CreateInvoiceInput["lineItems"] | undefined,
    subtotal: body.subtotal != null ? Number(body.subtotal) : undefined,
    taxRate: body.taxRate === "" || body.taxRate == null ? null : Number(body.taxRate),
    taxAmount: body.taxAmount === "" || body.taxAmount == null ? null : Number(body.taxAmount),
    discount: body.discount === "" || body.discount == null ? null : Number(body.discount),
    total: body.total != null ? Number(body.total) : undefined,
    dueDate: body.dueDate != null ? String(body.dueDate) : undefined,
    status: body.status as CreateInvoiceInput["status"] | undefined,
    notes: body.notes === "" || body.notes == null ? null : String(body.notes),
    terms: body.terms === "" || body.terms == null ? null : String(body.terms),
  } as CreateInvoiceInput | UpdateInvoiceInput;
}

export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListInvoicesRequest).validated;
    const result = await this.invoicesService.listInvoices(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Invoices retrieved successfully",
      data: result,
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.invoicesService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Invoice form options retrieved successfully",
      data: options,
    });
  });

  getByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetInvoiceRequest).validated;
    const invoice = await this.invoicesService.getInvoiceByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Invoice retrieved successfully",
      data: { invoice },
    });
  });

  getAuditTrail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetInvoiceAuditRequest).validated;
    const auditTrail = await this.invoicesService.getAuditTrail(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Invoice audit trail retrieved successfully",
      data: { auditTrail },
    });
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parsed = createInvoiceSchema.shape.body.safeParse(parseInvoiceBody(req.body as Record<string, unknown>));
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
    }

    const invoice = await this.invoicesService.createInvoice(req.user!.companyId, parsed.data, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: { invoice },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as UpdateInvoiceRequest).validated;
    const parsed = updateInvoiceSchema.shape.body.safeParse(parseInvoiceBody(req.body as Record<string, unknown>));
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
    }

    const invoice = await this.invoicesService.updateInvoice(req.user!.companyId, params.uuid, parsed.data, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: { invoice },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteInvoiceRequest).validated;
    await this.invoicesService.deleteInvoice(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  });
}
