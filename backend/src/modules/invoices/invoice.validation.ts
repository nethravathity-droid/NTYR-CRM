import { z } from "zod";

export const invoiceStatusSchema = z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]);

export const invoiceLineItemSchema = z.object({
  description: z.string().trim().min(1, "Line item description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  rate: z.coerce.number().min(0, "Rate cannot be negative"),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
});

export const listInvoicesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: invoiceStatusSchema.optional(),
    bookingId: z.coerce.number().int().positive().optional(),
    projectId: z.coerce.number().int().positive().optional(),
    fromDueDate: z.string().optional(),
    toDueDate: z.string().optional(),
    sortBy: z.enum(["due_date", "total", "created_at", "status", "invoice_number"]).default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(1, "Customer name is required"),
    customerEmail: z.string().trim().email("Invalid email").optional().nullable(),
    customerPhone: z.string().trim().optional().nullable(),
    customerAddress: z.string().trim().optional().nullable(),
    bookingId: z.coerce.number().int().positive().optional().nullable(),
    projectId: z.coerce.number().int().positive().optional().nullable(),
    unitId: z.coerce.number().int().positive().optional().nullable(),
    lineItems: z.array(invoiceLineItemSchema).min(1, "At least one line item is required"),
    subtotal: z.coerce.number().min(0, "Subtotal cannot be negative"),
    taxRate: z.coerce.number().min(0).max(100).optional().nullable(),
    taxAmount: z.coerce.number().min(0).optional().nullable(),
    discount: z.coerce.number().min(0).optional().nullable(),
    total: z.coerce.number().min(0, "Total cannot be negative"),
    dueDate: z.string().min(1, "Due date is required"),
    status: invoiceStatusSchema.default("DRAFT"),
    notes: z.string().trim().optional().nullable(),
    terms: z.string().trim().optional().nullable(),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid invoice UUID"),
  }),
  body: z.object({
    customerName: z.string().trim().min(1).optional(),
    customerEmail: z.string().trim().email().optional().nullable(),
    customerPhone: z.string().trim().optional().nullable(),
    customerAddress: z.string().trim().optional().nullable(),
    bookingId: z.coerce.number().int().positive().optional().nullable(),
    projectId: z.coerce.number().int().positive().optional().nullable(),
    unitId: z.coerce.number().int().positive().optional().nullable(),
    lineItems: z.array(invoiceLineItemSchema).min(1).optional(),
    subtotal: z.coerce.number().min(0).optional(),
    taxRate: z.coerce.number().min(0).max(100).optional().nullable(),
    taxAmount: z.coerce.number().min(0).optional().nullable(),
    discount: z.coerce.number().min(0).optional().nullable(),
    total: z.coerce.number().min(0).optional(),
    dueDate: z.string().min(1).optional(),
    status: invoiceStatusSchema.optional(),
    notes: z.string().trim().optional().nullable(),
    terms: z.string().trim().optional().nullable(),
  }),
});

export const getInvoiceSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid invoice UUID"),
  }),
});

export const deleteInvoiceSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid invoice UUID"),
  }),
});

export const getInvoiceAuditSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid invoice UUID"),
  }),
});

export type ListInvoicesQuery = z.infer<typeof listInvoicesSchema>["query"];
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>["body"];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>["body"];
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>;
