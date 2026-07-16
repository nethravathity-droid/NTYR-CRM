import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  BookingAuditEntry,
  BookingDetail,
  BookingDocumentItem,
  BookingDocumentType,
  BookingFormOptions,
  BookingFormValues,
  BookingListItem,
  ListBookingsParams,
  PaginatedBookings,
} from "@/features/bookings/types/booking.types";

function normalizeBookingPayload(values: BookingFormValues) {
  return {
    leadId: values.leadId,
    customerName: values.customerName,
    projectId: values.projectId,
    unitId: values.unitId,
    bookingDate: values.bookingDate,
    bookingAmount: values.bookingAmount,
    totalUnitPrice: values.totalUnitPrice,
    discountAmount: values.discountAmount,
    finalPrice: values.finalPrice,
    paymentPlan: values.paymentPlan.trim() || null,
    status: values.status,
    telecallerUserId: values.telecallerUserId,
    salesExecutiveUserId: values.salesExecutiveUserId,
    branchId: values.branchId,
    notes: values.notes.trim() || null,
  };
}

export const bookingsService = {
  async list(params: ListBookingsParams = {}): Promise<PaginatedBookings> {
    const response = await apiClient.get<ApiResponse<PaginatedBookings>>("/bookings", { params });
    return response.data.data;
  },

  async getFormOptions(): Promise<BookingFormOptions> {
    const response = await apiClient.get<ApiResponse<BookingFormOptions>>("/bookings/form-options");
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<BookingDetail> {
    const response = await apiClient.get<ApiResponse<{ booking: BookingDetail }>>(`/bookings/${uuid}`);
    return response.data.data.booking;
  },

  async getAuditTrail(uuid: string): Promise<BookingAuditEntry[]> {
    const response = await apiClient.get<ApiResponse<{ auditTrail: BookingAuditEntry[] }>>(`/bookings/${uuid}/audit-trail`);
    return response.data.data.auditTrail;
  },

  async create(values: BookingFormValues): Promise<BookingDetail> {
    const response = await apiClient.post<ApiResponse<{ booking: BookingDetail }>>("/bookings", normalizeBookingPayload(values));
    return response.data.data.booking;
  },

  async update(uuid: string, values: BookingFormValues): Promise<BookingDetail> {
    const response = await apiClient.put<ApiResponse<{ booking: BookingDetail }>>(`/bookings/${uuid}`, normalizeBookingPayload(values));
    return response.data.data.booking;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/bookings/${uuid}`);
  },

  async approve(uuid: string, notes?: string | null): Promise<BookingDetail> {
    const response = await apiClient.patch<ApiResponse<{ booking: BookingDetail }>>(`/bookings/${uuid}/approve`, { notes });
    return response.data.data.booking;
  },

  async reject(uuid: string, notes: string): Promise<BookingDetail> {
    const response = await apiClient.patch<ApiResponse<{ booking: BookingDetail }>>(`/bookings/${uuid}/reject`, { notes });
    return response.data.data.booking;
  },

  async cancel(uuid: string, notes?: string | null): Promise<BookingDetail> {
    const response = await apiClient.patch<ApiResponse<{ booking: BookingDetail }>>(`/bookings/${uuid}/cancel`, { notes });
    return response.data.data.booking;
  },

  async uploadDocument(uuid: string, documentType: BookingDocumentType, file: File): Promise<BookingDocumentItem> {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<{ document: BookingDocumentItem }>>(
      `/bookings/${uuid}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return response.data.data.document;
  },
};

export type { BookingListItem };
