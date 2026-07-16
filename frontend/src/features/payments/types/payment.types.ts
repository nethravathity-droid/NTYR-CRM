export type PaymentType =
  | "BOOKING_AMOUNT"
  | "DOWN_PAYMENT"
  | "INSTALLMENT"
  | "PLC"
  | "REGISTRATION"
  | "OTHER";

export type PaymentMode = "CASH" | "UPI" | "NEFT" | "RTGS" | "CHEQUE" | "CARD";

export type PaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "FAILED" | "REFUNDED";

export interface PaymentListItem {
  id: number;
  uuid: string;
  paymentNumber: string;
  booking: { id: number; uuid: string; bookingNumber: string };
  customerName: string;
  project: { id: number; uuid: string; projectName: string; projectCode: string };
  unit: { id: number; uuid: string; unitNumber: string };
  paymentType: PaymentType;
  amount: number;
  dueAmount: number;
  dueDate: string;
  paymentDate: string | null;
  paymentMode: PaymentMode | null;
  transactionReference: string | null;
  bankName: string | null;
  receiptNumber: string | null;
  status: PaymentStatus;
  notes: string | null;
  hasReceipt: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetail extends PaymentListItem {
  receiptFileUrl: string | null;
  receiptOriginalFileName: string | null;
  receiptMimeType: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface PaymentAuditEntry {
  id: number;
  uuid: string;
  action: string;
  changes: Record<string, unknown> | null;
  performedBy: number | null;
  performerName: string | null;
  createdAt: string;
}

export interface CollectionSummary {
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  paidCount: number;
  pendingCount: number;
  partialCount: number;
  overdueCount: number;
  failedCount: number;
  refundedCount: number;
}

export interface PaginatedPayments {
  payments: PaymentListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface PaymentFormOptions {
  bookings: Array<{
    id: number;
    uuid: string;
    bookingNumber: string;
    customerName: string;
    projectId: number;
    unitId: number;
    finalPrice: number;
  }>;
  projects: Array<{ id: number; uuid: string; projectName: string; projectCode: string }>;
  units: Array<{ id: number; uuid: string; projectId: number; unitNumber: string }>;
  paymentTypes: PaymentType[];
  paymentModes: PaymentMode[];
  statuses: PaymentStatus[];
}

export interface PaymentFormValues {
  bookingId: number | null;
  customerName: string;
  projectId: number | null;
  unitId: number | null;
  paymentType: PaymentType;
  amount: number;
  dueAmount: number;
  dueDate: string;
  paymentDate: string;
  paymentMode: PaymentMode | "";
  transactionReference: string;
  bankName: string;
  receiptNumber: string;
  status: PaymentStatus;
  notes: string;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  paymentMode?: PaymentMode;
  bookingId?: number;
  projectId?: number;
  unitId?: number;
  fromDueDate?: string;
  toDueDate?: string;
  fromPaymentDate?: string;
  toPaymentDate?: string;
  sortBy?: "due_date" | "payment_date" | "amount" | "customer_name" | "created_at" | "status";
  sortOrder?: "asc" | "desc";
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  BOOKING_AMOUNT: "Booking Amount",
  DOWN_PAYMENT: "Down Payment",
  INSTALLMENT: "Installment",
  PLC: "PLC",
  REGISTRATION: "Registration",
  OTHER: "Other",
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  NEFT: "NEFT",
  RTGS: "RTGS",
  CHEQUE: "Cheque",
  CARD: "Card",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PARTIAL: "Partial",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const paymentDefaultValues: PaymentFormValues = {
  bookingId: null,
  customerName: "",
  projectId: null,
  unitId: null,
  paymentType: "INSTALLMENT",
  amount: 0,
  dueAmount: 0,
  dueDate: new Date().toISOString().slice(0, 10),
  paymentDate: "",
  paymentMode: "",
  transactionReference: "",
  bankName: "",
  receiptNumber: "",
  status: "PENDING",
  notes: "",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function resolveFileUrl(fileUrl: string, apiBaseUrl: string): string {
  if (fileUrl.startsWith("http")) return fileUrl;
  return `${apiBaseUrl.replace(/\/api\/v1\/?$/, "")}${fileUrl}`;
}
