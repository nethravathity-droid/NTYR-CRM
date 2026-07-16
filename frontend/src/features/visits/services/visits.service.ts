import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  ListVisitsParams,
  PaginatedVisits,
  VisitAuditEntry,
  VisitDetail,
  VisitFormOptions,
  VisitFormValues,
  VisitListItem,
} from "@/features/visits/types/visit.types";

function normalizeVisitPayload(values: VisitFormValues) {
  return {
    leadId: values.leadId,
    customerName: values.customerName,
    mobile: values.mobile,
    projectId: values.projectId,
    unitId: values.unitId,
    visitDate: values.visitDate,
    visitTime: values.visitTime,
    assignedUserId: values.assignedUserId,
    status: values.status,
    transportationRequired: values.transportationRequired,
    pickupLocation: values.pickupLocation.trim() || null,
    feedback: values.feedback.trim() || null,
    rating: values.rating,
    nextAction: values.nextAction.trim() || null,
    notes: values.notes.trim() || null,
  };
}

export const visitsService = {
  async list(params: ListVisitsParams = {}): Promise<PaginatedVisits> {
    const response = await apiClient.get<ApiResponse<PaginatedVisits>>("/visits", { params });
    return response.data.data;
  },

  async getFormOptions(): Promise<VisitFormOptions> {
    const response = await apiClient.get<ApiResponse<VisitFormOptions>>("/visits/form-options");
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<VisitDetail> {
    const response = await apiClient.get<ApiResponse<{ visit: VisitDetail }>>(`/visits/${uuid}`);
    return response.data.data.visit;
  },

  async getAuditTrail(uuid: string): Promise<VisitAuditEntry[]> {
    const response = await apiClient.get<ApiResponse<{ auditTrail: VisitAuditEntry[] }>>(`/visits/${uuid}/audit-trail`);
    return response.data.data.auditTrail;
  },

  async create(values: VisitFormValues): Promise<VisitDetail> {
    const response = await apiClient.post<ApiResponse<{ visit: VisitDetail }>>("/visits", normalizeVisitPayload(values));
    return response.data.data.visit;
  },

  async update(uuid: string, values: VisitFormValues): Promise<VisitDetail> {
    const response = await apiClient.put<ApiResponse<{ visit: VisitDetail }>>(`/visits/${uuid}`, normalizeVisitPayload(values));
    return response.data.data.visit;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/visits/${uuid}`);
  },

  async complete(uuid: string, payload: { feedback?: string | null; rating?: number | null; nextAction?: string | null; notes?: string | null }): Promise<VisitDetail> {
    const response = await apiClient.patch<ApiResponse<{ visit: VisitDetail }>>(`/visits/${uuid}/complete`, payload);
    return response.data.data.visit;
  },

  async cancel(uuid: string, payload: { notes?: string | null } = {}): Promise<VisitDetail> {
    const response = await apiClient.patch<ApiResponse<{ visit: VisitDetail }>>(`/visits/${uuid}/cancel`, payload);
    return response.data.data.visit;
  },
};

export type { VisitListItem };
