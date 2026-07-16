import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  FollowupDetail,
  FollowupFormOptions,
  FollowupFormValues,
  FollowupListItem,
  ListFollowupsParams,
  PaginatedFollowups,
} from "@/features/followups/types/followup.types";

function normalizeFollowupPayload(values: FollowupFormValues) {
  return {
    leadId: values.leadId ?? null,
    customerName: values.customerName,
    assignedUserId: values.assignedUserId ?? null,
    followupDate: values.followupDate,
    followupTime: values.followupTime,
    type: values.type,
    priority: values.priority,
    status: values.status,
    notes: values.notes.trim() || null,
    reminderBefore: values.reminderBefore,
    nextFollowupDate: values.nextFollowupDate || null,
  };
}

export const followupsService = {
  async list(params: ListFollowupsParams = {}): Promise<PaginatedFollowups> {
    const response = await apiClient.get<ApiResponse<PaginatedFollowups>>("/followups", { params });
    return response.data.data;
  },

  async getToday(): Promise<FollowupListItem[]> {
    const response = await apiClient.get<ApiResponse<FollowupListItem[]>>("/followups/today");
    return response.data.data;
  },

  async getOverdue(): Promise<FollowupListItem[]> {
    const response = await apiClient.get<ApiResponse<FollowupListItem[]>>("/followups/overdue");
    return response.data.data;
  },

  async getFormOptions(): Promise<FollowupFormOptions> {
    const response = await apiClient.get<ApiResponse<FollowupFormOptions>>("/followups/form-options");
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<FollowupDetail> {
    const response = await apiClient.get<ApiResponse<{ followup: FollowupDetail }>>(`/followups/${uuid}`);
    return response.data.data.followup;
  },

  async create(values: FollowupFormValues): Promise<FollowupDetail> {
    const response = await apiClient.post<ApiResponse<{ followup: FollowupDetail }>>(
      "/followups",
      normalizeFollowupPayload(values),
    );
    return response.data.data.followup;
  },

  async update(uuid: string, values: FollowupFormValues): Promise<FollowupDetail> {
    const response = await apiClient.put<ApiResponse<{ followup: FollowupDetail }>>(
      `/followups/${uuid}`,
      normalizeFollowupPayload(values),
    );
    return response.data.data.followup;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/followups/${uuid}`);
  },

  async complete(uuid: string): Promise<FollowupDetail> {
    const response = await apiClient.patch<ApiResponse<{ followup: FollowupDetail }>>(`/followups/${uuid}/complete`);
    return response.data.data.followup;
  },

  async reschedule(
    uuid: string,
    payload: { followupDate: string; followupTime: string; notes?: string | null },
  ): Promise<FollowupDetail> {
    const response = await apiClient.patch<ApiResponse<{ followup: FollowupDetail }>>(
      `/followups/${uuid}/reschedule`,
      payload,
    );
    return response.data.data.followup;
  },
};
