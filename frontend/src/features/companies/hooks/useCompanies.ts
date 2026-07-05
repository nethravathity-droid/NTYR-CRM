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
import type { CompanyFormSchema } from "@/features/companies/schemas/company.schema";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params: ListCompaniesParams) =>
    [...companyKeys.lists(), params] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (uuid: string) => [...companyKeys.details(), uuid] as const,
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
    mutationFn: (values: CompanyFormSchema) => companiesService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
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

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => companiesService.remove(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}
