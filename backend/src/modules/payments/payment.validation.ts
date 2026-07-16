import { z } from "zod";

export const paymentTypeSchema = z.enum([
  "BOOKING_AMOUNT",
  "DOWN_PAYMENT",
  "INSTALLMENT",
  "PLC",
  "REGISTRATION",
  "OTHER",
]);

export const paymentModeSchema = z.enum(["CASH", "UPI", "NEFT", "RTGS", "CHEQUE", "CARD"]);

export const paymentStatusSchema = z.enum(["PENDING", "PAID", "PARTIAL", "FAILED", "REFUNDED"]);

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid payment UUID"),
  }),
});

const moneySchema = z.coerce.number().min(0);

const paymentBaseSchema = z.object({
  bookingId: z.number().int().positive(),
  customerName: z.string().trim().min(1).max(200),
  projectId: z.number().int().positive(),
  unitId: z.number().int().positive(),
  paymentType: paymentTypeSchema,
  amount: moneySchema,
  dueAmount: moneySchema,
  dueDate: z.string().min(1),
  paymentDate: z.string().nullable().optional(),
  paymentMode: paymentModeSchema.nullable().optional(),
  transactionReference: z.string().trim().max(100).nullable().optional(),
  bankName: z.string().trim().max(200).nullable().optional(),
  receiptNumber: z.string().trim().max(100).nullable().optional(),
  status: paymentStatusSchema.default("PENDING"),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export const listPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: paymentStatusSchema.optional(),
    paymentType: paymentTypeSchema.optional(),
    paymentMode: paymentModeSchema.optional(),
    bookingId: z.coerce.number().int().positive().optional(),
    projectId: z.coerce.number().int().positive().optional(),
    unitId: z.coerce.number().int().positive().optional(),
    fromDueDate: z.string().optional(),
    toDueDate: z.string().optional(),
    fromPaymentDate: z.string().optional(),
    toPaymentDate: z.string().optional(),
    sortBy: z.enum(["due_date", "payment_date", "amount", "customer_name", "created_at", "status"]).default("due_date"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const schedulePaymentsSchema = z.object({
  query: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    bookingId: z.coerce.number().int().positive().optional(),
    projectId: z.coerce.number().int().positive().optional(),
  }),
});

export const createPaymentSchema = z.object({ body: paymentBaseSchema });
export const updatePaymentSchema = uuidParamSchema.extend({ body: paymentBaseSchema.partial() });
export const getPaymentSchema = uuidParamSchema;
export const deletePaymentSchema = uuidParamSchema;
export const getPaymentAuditSchema = uuidParamSchema;

export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>["query"];
export type SchedulePaymentsQuery = z.infer<typeof schedulePaymentsSchema>["query"];
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>["body"];
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>["body"];
