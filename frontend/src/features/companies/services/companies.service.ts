import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CompanyDetail,
  CompanyStatus,
  ListCompaniesParams,
  PaginatedCompanies,
} from "@/features/companies/types/company.types";
import type { CompanyFormSchema } from "@/features/companies/schemas/company.schema";
import { normalizeCompanyPayload } from "@/features/companies/schemas/company.schema";

export const companiesService = {
  async list(params: ListCompaniesParams = {}): Promise<PaginatedCompanies> {
    const response = await apiClient.get<ApiResponse<PaginatedCompanies>>(
      "/companies",
      { params },
    );
    return response.data.data;
  },

  async getByUuid(uuid: string): Promise<CompanyDetail> {
    const response = await apiClient.get<ApiResponse<{ company: CompanyDetail }>>(
      `/companies/${uuid}`,
    );
    return response.data.data.company;
  },

  async create(values: CompanyFormSchema): Promise<CompanyDetail> {
    const response = await apiClient.post<ApiResponse<{ company: CompanyDetail }>>(
      "/companies",
      normalizeCompanyPayload(values),
    );
    return response.data.data.company;
  },

  async update(uuid: string, values: CompanyFormSchema): Promise<CompanyDetail> {
    const response = await apiClient.put<ApiResponse<{ company: CompanyDetail }>>(
      `/companies/${uuid}`,
      normalizeCompanyPayload(values),
    );
    return response.data.data.company;
  },

  async updateStatus(uuid: string, status: CompanyStatus): Promise<CompanyDetail> {
    const response = await apiClient.patch<
      ApiResponse<{ company: CompanyDetail }>
    >(`/companies/${uuid}/status`, { status });
    return response.data.data.company;
  },

  async updateActive(uuid: string, isActive: boolean): Promise<CompanyDetail> {
    const response = await apiClient.patch<
      ApiResponse<{ company: CompanyDetail }>
    >(`/companies/${uuid}/active`, { isActive });
    return response.data.data.company;
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/companies/${uuid}`);
  },
};
