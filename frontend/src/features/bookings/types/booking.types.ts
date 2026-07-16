export type BookingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type BookingDocumentType =
  | "AADHAAR"
  | "PAN"
  | "PASSPORT"
  | "ADDRESS_PROOF"
  | "PHOTOGRAPH"
  | "BOOKING_FORM"
  | "AGREEMENT_COPY";

export interface BookingListItem {
  id: number;
  uuid: string;
  bookingNumber: string;
  lead: { id: number; uuid: string; leadNumber: string; customerName: string } | null;
  customerName: string;
  project: { id: number; uuid: string; projectName: string; projectCode: string };
  unit: { id: number; uuid: string; unitNumber: string };
  bookingDate: string;
  bookingAmount: number;
  totalUnitPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentPlan: string | null;
  status: BookingStatus;
  telecaller: { id: number; uuid: string; employeeCode: string; displayName: string | null } | null;
  salesExecutive: { id: number; uuid: string; employeeCode: string; displayName: string | null } | null;
  branch: { id: number; uuid: string; branchName: string; branchCode: string } | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDocumentItem {
  id: number;
  uuid: string;
  documentType: BookingDocumentType;
  originalFileName: string;
  fileUrl: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedBy: number | null;
  createdAt: string;
}

export interface BookingDetail extends BookingListItem {
  approvalNotes: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  documents: BookingDocumentItem[];
  createdBy: number | null;
  updatedBy: number | null;
}

export interface BookingAuditEntry {
  id: number;
  uuid: string;
  action: string;
  changes: Record<string, unknown> | null;
  performedBy: number | null;
  performerName: string | null;
  createdAt: string;
}

export interface PaginatedBookings {
  bookings: BookingListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface BookingFormOptions {
  leads: Array<{ id: number; uuid: string; leadNumber: string; customerName: string }>;
  projects: Array<{ id: number; uuid: string; projectName: string; projectCode: string }>;
  units: Array<{ id: number; uuid: string; projectId: number; unitNumber: string; price: number | null; availability: string }>;
  users: Array<{ id: number; uuid: string; employeeCode: string; displayName: string | null }>;
  branches: Array<{ id: number; uuid: string; branchName: string; branchCode: string }>;
  statuses: BookingStatus[];
  documentTypes: BookingDocumentType[];
}

export interface BookingFormValues {
  leadId: number | null;
  customerName: string;
  projectId: number | null;
  unitId: number | null;
  bookingDate: string;
  bookingAmount: number;
  totalUnitPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentPlan: string;
  status: BookingStatus;
  telecallerUserId: number | null;
  salesExecutiveUserId: number | null;
  branchId: number | null;
  notes: string;
}

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  projectId?: number;
  unitId?: number;
  branchId?: number;
  salesExecutiveUserId?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: "booking_date" | "customer_name" | "created_at" | "status" | "final_price";
  sortOrder?: "asc" | "desc";
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const BOOKING_DOCUMENT_LABELS: Record<BookingDocumentType, string> = {
  AADHAAR: "Aadhaar",
  PAN: "PAN",
  PASSPORT: "Passport (Optional)",
  ADDRESS_PROOF: "Address Proof",
  PHOTOGRAPH: "Photograph",
  BOOKING_FORM: "Booking Form",
  AGREEMENT_COPY: "Agreement Copy",
};

export const REQUIRED_DOCUMENT_TYPES: BookingDocumentType[] = [
  "AADHAAR",
  "PAN",
  "ADDRESS_PROOF",
  "PHOTOGRAPH",
  "BOOKING_FORM",
  "AGREEMENT_COPY",
];

export const bookingDefaultValues: BookingFormValues = {
  leadId: null,
  customerName: "",
  projectId: null,
  unitId: null,
  bookingDate: new Date().toISOString().slice(0, 10),
  bookingAmount: 0,
  totalUnitPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  paymentPlan: "",
  status: "DRAFT",
  telecallerUserId: null,
  salesExecutiveUserId: null,
  branchId: null,
  notes: "",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
