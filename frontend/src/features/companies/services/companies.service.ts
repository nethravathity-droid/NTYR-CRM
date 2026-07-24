import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CompanyDetail,
  CompanyLoginSetup,
  CompanyStatus,
  CreateCompanyResult,
  InitialAdminLogin,
  ListCompaniesParams,
  PaginatedCompanies,
  ProvisionInitialAdminPayload,
} from "@/features/companies/types/company.types";
import type {
  CompanyCreateFormSchema,
  CompanyFormSchema,
} from "@/features/companies/schemas/company.schema";
import {
  normalizeCompanyCreatePayload,
  normalizeCompanyPayload,
} from "@/features/companies/schemas/company.schema";

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

  async create(values: CompanyCreateFormSchema): Promise<CreateCompanyResult> {
    const response = await apiClient.post<ApiResponse<CreateCompanyResult>>(
      "/companies",
      normalizeCompanyCreatePayload(values),
    );
    return response.data.data;
  },

  async getLoginSetup(uuid: string): Promise<CompanyLoginSetup> {
    const response = await apiClient.get<ApiResponse<CompanyLoginSetup>>(
      `/companies/${uuid}/login-setup`,
    );
    return response.data.data;
  },

  async provisionInitialAdmin(
    uuid: string,
    payload: ProvisionInitialAdminPayload,
  ): Promise<{ initialAdmin: InitialAdminLogin }> {
    const response = await apiClient.post<
      ApiResponse<{ initialAdmin: InitialAdminLogin }>
    >(`/companies/${uuid}/provision-admin`, payload);
    return response.data.data;
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
