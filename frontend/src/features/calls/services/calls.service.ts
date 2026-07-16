import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CallDashboardSummary,
  CallDetail,
  CallFormOptions,
  CallFormValues,
  CallTimelineEntry,
  ListCallsParams,
  PaginatedCalls,
  CallAuditEntry,
} from "@/features/calls/types/call.types";

function normalizeCallPayload(values: CallFormValues) {
  return {
    leadId: values.leadId,
    customerName: values.customerName,
    mobile: values.mobile,
    direction: values.direction,
    callStatus: values.callStatus,
    callDate: values.callDate,
    callTime: values.callTime,
    durationSeconds: values.durationSeconds,
    assignedUserId: values.assignedUserId,
    notes: values.notes.trim() || null,
    autoCreateFollowup: values.autoCreateFollowup,
    nextFollowupDate: values.autoCreateFollowup ? values.nextFollowupDate || null : null,
    nextFollowupTime: values.autoCreateFollowup ? values.nextFollowupTime || null : null,
  };
}

export const callsService = {
  async list(params: ListCallsParams = {}): Promise<PaginatedCalls> {
    const response = await apiClient.get<ApiResponse<PaginatedCalls>>("/calls", { params });
    return response.data.data;
  },

  async getSummary(params: { fromDate?: string; toDate?: string } = {}): Promise<CallDashboardSummary> {
    const response = await apiClient.get<ApiResponse<CallDashboardSummary>>("/calls/summary", { params });
    return response.data.data;
  },

  async getFormOptions(): Promise<CallFormOptions> {
    const response = await apiClient.get<ApiResponse<CallFormOptions>>("/calls/form-options");
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<CallDetail> {
    const response = await apiClient.get<ApiResponse<{ call: CallDetail }>>(`/calls/${uuid}`);
    return response.data.data.call;
  },

  async getTimeline(uuid: string): Promise<{ auditTrail: CallAuditEntry[]; timeline: CallTimelineEntry[] }> {
    const response = await apiClient.get<ApiResponse<{ auditTrail: CallAuditEntry[]; timeline: CallTimelineEntry[] }>>(
      `/calls/${uuid}/timeline`,
    );
    return response.data.data;
  },

  async create(values: CallFormValues): Promise<CallDetail> {
    const response = await apiClient.post<ApiResponse<{ call: CallDetail }>>("/calls", normalizeCallPayload(values));
    return response.data.data.call;
  },

  async update(uuid: string, values: CallFormValues): Promise<CallDetail> {
    const response = await apiClient.put<ApiResponse<{ call: CallDetail }>>(`/calls/${uuid}`, normalizeCallPayload(values));
    return response.data.data.call;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/calls/${uuid}`);
  },
};
