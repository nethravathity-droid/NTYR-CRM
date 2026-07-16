import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CollectionSummary,
  ListPaymentsParams,
  PaginatedPayments,
  PaymentAuditEntry,
  PaymentDetail,
  PaymentFormOptions,
  PaymentFormValues,
  PaymentListItem,
} from "@/features/payments/types/payment.types";

function buildFormData(values: PaymentFormValues, receipt?: File | null) {
  const formData = new FormData();
  formData.append("bookingId", String(values.bookingId));
  formData.append("customerName", values.customerName);
  formData.append("projectId", String(values.projectId));
  formData.append("unitId", String(values.unitId));
  formData.append("paymentType", values.paymentType);
  formData.append("amount", String(values.amount));
  formData.append("dueAmount", String(values.dueAmount));
  formData.append("dueDate", values.dueDate);
  formData.append("paymentDate", values.paymentDate);
  formData.append("paymentMode", values.paymentMode);
  formData.append("transactionReference", values.transactionReference);
  formData.append("bankName", values.bankName);
  formData.append("receiptNumber", values.receiptNumber);
  formData.append("status", values.status);
  formData.append("notes", values.notes);
  if (receipt) formData.append("receipt", receipt);
  return formData;
}

export const paymentsService = {
  async list(params: ListPaymentsParams = {}): Promise<PaginatedPayments> {
    const response = await apiClient.get<ApiResponse<PaginatedPayments>>("/payments", { params });
    return response.data.data;
  },

  async getCollectionSummary(): Promise<CollectionSummary> {
    const response = await apiClient.get<ApiResponse<{ summary: CollectionSummary }>>("/payments/collection-summary");
    return response.data.data.summary;
  },

  async getOutstanding(): Promise<PaymentListItem[]> {
    const response = await apiClient.get<ApiResponse<{ outstanding: PaymentListItem[] }>>("/payments/outstanding");
    return response.data.data.outstanding;
  },

  async getOverdue(): Promise<PaymentListItem[]> {
    const response = await apiClient.get<ApiResponse<{ overdue: PaymentListItem[] }>>("/payments/overdue");
    return response.data.data.overdue;
  },

  async getSchedule(params: { fromDate?: string; toDate?: string; bookingId?: number; projectId?: number } = {}) {
    const response = await apiClient.get<ApiResponse<{ schedule: PaymentListItem[] }>>("/payments/schedule", { params });
    return response.data.data.schedule;
  },

  async getFormOptions(): Promise<PaymentFormOptions> {
    const response = await apiClient.get<ApiResponse<PaymentFormOptions>>("/payments/form-options");
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<PaymentDetail> {
    const response = await apiClient.get<ApiResponse<{ payment: PaymentDetail }>>(`/payments/${uuid}`);
    return response.data.data.payment;
  },

  async getAuditTrail(uuid: string): Promise<PaymentAuditEntry[]> {
    const response = await apiClient.get<ApiResponse<{ auditTrail: PaymentAuditEntry[] }>>(`/payments/${uuid}/audit-trail`);
    return response.data.data.auditTrail;
  },

  async create(values: PaymentFormValues, receipt?: File | null): Promise<PaymentDetail> {
    const response = await apiClient.post<ApiResponse<{ payment: PaymentDetail }>>(
      "/payments",
      buildFormData(values, receipt),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data.payment;
  },

  async update(uuid: string, values: PaymentFormValues, receipt?: File | null): Promise<PaymentDetail> {
    const response = await apiClient.put<ApiResponse<{ payment: PaymentDetail }>>(
      `/payments/${uuid}`,
      buildFormData(values, receipt),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data.payment;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/payments/${uuid}`);
  },

  async uploadReceipt(uuid: string, file: File): Promise<PaymentDetail> {
    const formData = new FormData();
    formData.append("receipt", file);
    const response = await apiClient.post<ApiResponse<{ payment: PaymentDetail }>>(
      `/payments/${uuid}/receipt`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data.payment;
  },
};
