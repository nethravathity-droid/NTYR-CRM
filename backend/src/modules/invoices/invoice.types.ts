export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceRecord {
  id: number;
  uuid: string;
  company_id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  booking_id: number | null;
  project_id: number | null;
  unit_id: number | null;
  line_items: InvoiceLineItem[];
  subtotal: string | number;
  tax_rate: string | number;
  tax_amount: string | number;
  discount: string | number;
  total: string | number;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
}

export interface InvoiceListItem {
  id: number;
  uuid: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
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
  receiptFileUrl: string | null;
  receiptOriginalFileName: string | null;
  receiptMimeType: string | null;
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

export interface CreateInvoiceData {
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

export type UpdateInvoiceData = Partial<CreateInvoiceData>;
