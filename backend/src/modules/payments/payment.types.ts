export type PaymentType =
  | "BOOKING_AMOUNT"
  | "DOWN_PAYMENT"
  | "INSTALLMENT"
  | "PLC"
  | "REGISTRATION"
  | "OTHER";

export type PaymentMode = "CASH" | "UPI" | "NEFT" | "RTGS" | "CHEQUE" | "CARD";

export type PaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "FAILED" | "REFUNDED";

export interface PaymentRecord {
  id: number;
  uuid: string;
  company_id: number;
  payment_number: string;
  booking_id: number;
  customer_name: string;
  project_id: number;
  unit_id: number;
  payment_type: PaymentType;
  amount: string | number;
  due_amount: string | number;
  due_date: string;
  payment_date: string | null;
  payment_mode: PaymentMode | null;
  transaction_reference: string | null;
  bank_name: string | null;
  receipt_number: string | null;
  status: PaymentStatus;
  notes: string | null;
  receipt_file_path: string | null;
  receipt_original_file_name: string | null;
  receipt_mime_type: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
}

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

export interface PaginatedPayments {
  payments: PaymentListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
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

export interface CreatePaymentData {
  bookingId: number;
  customerName: string;
  projectId: number;
  unitId: number;
  paymentType: PaymentType;
  amount: number;
  dueAmount: number;
  dueDate: string;
  paymentDate?: string | null;
  paymentMode?: PaymentMode | null;
  transactionReference?: string | null;
  bankName?: string | null;
  receiptNumber?: string | null;
  status?: PaymentStatus;
  notes?: string | null;
  receiptFilePath?: string | null;
  receiptOriginalFileName?: string | null;
  receiptMimeType?: string | null;
}

export type UpdatePaymentData = Partial<CreatePaymentData>;
