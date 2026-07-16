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

export interface BookingRecord {
  id: number;
  uuid: string;
  company_id: number;
  booking_number: string;
  lead_id: number | null;
  customer_name: string;
  project_id: number;
  unit_id: number;
  booking_date: string;
  booking_amount: string | number;
  total_unit_price: string | number;
  discount_amount: string | number;
  final_price: string | number;
  payment_plan: string | null;
  status: BookingStatus;
  telecaller_user_id: number | null;
  sales_executive_user_id: number | null;
  branch_id: number | null;
  notes: string | null;
  approval_notes: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
}

export interface BookingDocumentRecord {
  id: number;
  uuid: string;
  company_id: number;
  booking_id: number;
  document_type: BookingDocumentType;
  original_file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: number | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: number | null;
}

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

export interface CreateBookingData {
  leadId?: number | null;
  customerName: string;
  projectId: number;
  unitId: number;
  bookingDate: string;
  bookingAmount: number;
  totalUnitPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentPlan?: string | null;
  status?: BookingStatus;
  telecallerUserId?: number | null;
  salesExecutiveUserId?: number | null;
  branchId?: number | null;
  notes?: string | null;
}

export type UpdateBookingData = Partial<CreateBookingData>;

export interface UploadBookingDocumentData {
  documentType: BookingDocumentType;
  originalFileName: string;
  filePath: string;
  mimeType?: string | null;
  fileSize?: number | null;
}
