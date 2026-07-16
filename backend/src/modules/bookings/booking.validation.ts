import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

export const bookingDocumentTypeSchema = z.enum([
  "AADHAAR",
  "PAN",
  "PASSPORT",
  "ADDRESS_PROOF",
  "PHOTOGRAPH",
  "BOOKING_FORM",
  "AGREEMENT_COPY",
]);

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid booking UUID"),
  }),
});

const moneySchema = z.coerce.number().min(0);

const bookingBaseSchema = z.object({
  leadId: z.number().int().positive().nullable().optional(),
  customerName: z.string().trim().min(1).max(200),
  projectId: z.number().int().positive(),
  unitId: z.number().int().positive(),
  bookingDate: z.string().min(1),
  bookingAmount: moneySchema,
  totalUnitPrice: moneySchema,
  discountAmount: moneySchema.default(0),
  finalPrice: moneySchema,
  paymentPlan: z.string().trim().max(2000).nullable().optional(),
  status: bookingStatusSchema.default("DRAFT"),
  telecallerUserId: z.number().int().positive().nullable().optional(),
  salesExecutiveUserId: z.number().int().positive().nullable().optional(),
  branchId: z.number().int().positive().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
}).superRefine((data, ctx) => {
  const expectedFinal = Number((data.totalUnitPrice - data.discountAmount).toFixed(2));
  const actualFinal = Number(data.finalPrice.toFixed(2));
  if (expectedFinal !== actualFinal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Final price must equal total unit price minus discount amount",
      path: ["finalPrice"],
    });
  }
});

export const listBookingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: bookingStatusSchema.optional(),
    projectId: z.coerce.number().int().positive().optional(),
    unitId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    salesExecutiveUserId: z.coerce.number().int().positive().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    sortBy: z.enum(["booking_date", "customer_name", "created_at", "status", "final_price"]).default("booking_date"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createBookingSchema = z.object({ body: bookingBaseSchema });
export const updateBookingSchema = uuidParamSchema.extend({ body: bookingBaseSchema.partial() });
export const getBookingSchema = uuidParamSchema;
export const deleteBookingSchema = uuidParamSchema;
export const getBookingAuditSchema = uuidParamSchema;

export const approveBookingSchema = uuidParamSchema.extend({
  body: z.object({
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
});

export const rejectBookingSchema = uuidParamSchema.extend({
  body: z.object({
    notes: z.string().trim().min(1).max(4000),
  }),
});

export const cancelBookingSchema = uuidParamSchema.extend({
  body: z.object({
    notes: z.string().trim().max(4000).nullable().optional(),
  }),
});

export const uploadBookingDocumentSchema = uuidParamSchema.extend({
  body: z.object({
    documentType: bookingDocumentTypeSchema,
  }),
});

export type ListBookingsQuery = z.infer<typeof listBookingsSchema>["query"];
export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>["body"];
export type ApproveBookingInput = z.infer<typeof approveBookingSchema>["body"];
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>["body"];
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>["body"];
export type UploadBookingDocumentInput = z.infer<typeof uploadBookingDocumentSchema>["body"];
