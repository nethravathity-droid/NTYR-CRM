export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceListItem {
  id: number;
  uuid: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  booking: { id: number; uuid: string; bookingNumber: string } | null;
  project: { id: number; uuid: string; projectName: string; projectCode: string } | null;
  unit: { id: number; uuid: string; unitNumber: string } | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  dueDate: string;
  status: InvoiceStatus;
  notes: string | null;
  terms: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDetail extends InvoiceListItem {
  createdBy: number | null;
  updatedBy: number | null;
}

export interface InvoiceAuditEntry {
  id: number;
  uuid: string;
  action: string;
  changes: Record<string, unknown> | null;
  performedBy: number | null;
  performerName: string | null;
  createdAt: string;
}

export interface PaginatedInvoices {
  invoices: InvoiceListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface InvoiceFormOptions {
  bookings: Array<{
    id: number;
    uuid: string;
    bookingNumber: string;
    customerName: string;
    projectId: number;
    unitId: number;
  }>;
  projects: Array<{ id: number; uuid: string; projectName: string; projectCode: string }>;
  units: Array<{ id: number; uuid: string; projectId: number; unitNumber: string }>;
  statuses: InvoiceStatus[];
}

export interface InvoiceFormValues {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  bookingId: number | null;
  projectId: number | null;
  unitId: number | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  terms: string;
}

export interface CreateInvoiceInput {
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  bookingId?: number | null;
  projectId?: number | null;
  unitId?: number | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate?: number | null;
  taxAmount?: number | null;
  discount?: number | null;
  total: number;
  dueDate: string;
  status?: InvoiceStatus;
  notes?: string | null;
  terms?: string | null;
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  bookingId?: number;
  projectId?: number;
  fromDueDate?: string;
  toDueDate?: string;
  sortBy?: "due_date" | "total" | "created_at" | "status" | "invoice_number";
  sortOrder?: "asc" | "desc";
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export const invoiceDefaultValues: InvoiceFormValues = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerAddress: "",
  bookingId: null,
  projectId: null,
  unitId: null,
  lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
  subtotal: 0,
  taxRate: 0,
  taxAmount: 0,
  discount: 0,
  total: 0,
  dueDate: new Date().toISOString().slice(0, 10),
  status: "DRAFT",
  notes: "",
  terms: "",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
