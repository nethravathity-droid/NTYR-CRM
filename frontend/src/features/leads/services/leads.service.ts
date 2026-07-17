import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  AssignLeadsPayload,
  BulkUpdateLeadsPayload,
  DuplicateLeadMatch,
  ImportLeadsResult,
  LeadDetail,
  LeadFormOptions,
  LeadAuditEntry,
  ListLeadsParams,
  PaginatedLeads,
} from "@/features/leads/types/lead.types";
import {
  normalizeLeadPayload,
  type LeadFormSchema,
} from "@/features/leads/schemas/lead.schema";

export const leadsService = {
  async list(params: ListLeadsParams = {}): Promise<PaginatedLeads> {
    const response = await apiClient.get<ApiResponse<PaginatedLeads>>("/leads", {
      params,
    });
    return response.data.data;
  },

  async getFormOptions(): Promise<LeadFormOptions> {
    const response = await apiClient.get<ApiResponse<LeadFormOptions>>(
      "/leads/form-options",
    );
    return response.data.data;
  },

  async checkDuplicates(params: {
    mobile?: string;
    email?: string;
    excludeUuid?: string;
  }): Promise<{
    mobileDuplicate: DuplicateLeadMatch | null;
    emailDuplicate: DuplicateLeadMatch | null;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        mobileDuplicate: DuplicateLeadMatch | null;
        emailDuplicate: DuplicateLeadMatch | null;
      }>
    >("/leads/check-duplicates", { params });
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<LeadDetail> {
    const response = await apiClient.get<ApiResponse<{ lead: LeadDetail }>>(
      `/leads/${uuid}`,
    );
    return response.data.data.lead;
  },

  async getAuditTrail(uuid: string): Promise<LeadAuditEntry[]> {
    const response = await apiClient.get<
      ApiResponse<{ auditTrail: LeadAuditEntry[] }>
    >(`/leads/${uuid}/audit-trail`);
    return response.data.data.auditTrail;
  },

  async create(values: LeadFormSchema): Promise<LeadDetail> {
    const response = await apiClient.post<ApiResponse<{ lead: LeadDetail }>>(
      "/leads",
      normalizeLeadPayload(values),
    );
    return response.data.data.lead;
  },

  async update(uuid: string, values: LeadFormSchema): Promise<LeadDetail> {
    const response = await apiClient.put<ApiResponse<{ lead: LeadDetail }>>(
      `/leads/${uuid}`,
      normalizeLeadPayload(values),
    );
    return response.data.data.lead;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/leads/${uuid}`);
  },

  async assign(payload: AssignLeadsPayload): Promise<{ assigned: number; failed: number }> {
    const response = await apiClient.post<
      ApiResponse<{ assigned: number; failed: number }>
    >("/leads/assign", payload);
    return response.data.data;
  },

  async bulkUpdate(
    payload: BulkUpdateLeadsPayload,
  ): Promise<{ updated: number; failed: number }> {
    const response = await apiClient.post<
      ApiResponse<{ updated: number; failed: number }>
    >("/leads/bulk-update", payload);
    return response.data.data;
  },

  async import(file: File, skipDuplicates = true): Promise<ImportLeadsResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("skipDuplicates", String(skipDuplicates));

    const response = await apiClient.post<ApiResponse<ImportLeadsResult>>(
      "/leads/import",
      formData,
    );

    return response.data.data;
  },
};
