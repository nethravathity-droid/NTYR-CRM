import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { companiesService } from "@/features/companies/services/companies.service";
import type {
  CompanyStatus,
  ListCompaniesParams,
} from "@/features/companies/types/company.types";
import type {
  CompanyCreateFormSchema,
  CompanyFormSchema,
} from "@/features/companies/schemas/company.schema";
import type { ProvisionInitialAdminPayload } from "@/features/companies/types/company.types";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params: ListCompaniesParams) =>
    [...companyKeys.lists(), params] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (uuid: string) => [...companyKeys.details(), uuid] as const,
  loginSetup: (uuid: string) => [...companyKeys.all, "login-setup", uuid] as const,
};

export function useCompanies(params: ListCompaniesParams) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCompany(uuid: string | undefined) {
  return useQuery({
    queryKey: companyKeys.detail(uuid ?? ""),
    queryFn: () => companiesService.getByUuid(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CompanyCreateFormSchema) => companiesService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useCompanyLoginSetup(uuid: string | undefined) {
  return useQuery({
    queryKey: companyKeys.loginSetup(uuid ?? ""),
    queryFn: () => companiesService.getLoginSetup(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useProvisionInitialAdmin(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProvisionInitialAdminPayload) =>
      companiesService.provisionInitialAdmin(uuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.loginSetup(uuid) });
    },
  });
}

export function useUpdateCompany(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CompanyFormSchema) =>
      companiesService.update(uuid, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: CompanyStatus }) =>
      companiesService.updateStatus(uuid, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      void queryClient.invalidateQueries({
        queryKey: companyKeys.detail(variables.uuid),
      });
    },
  });
}

export function useUpdateCompanyActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, isActive }: { uuid: string; isActive: boolean }) =>
      companiesService.updateActive(uuid, isActive),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      void queryClient.invalidateQueries({
        queryKey: companyKeys.detail(variables.uuid),
      });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => companiesService.remove(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}
