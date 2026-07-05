import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { leadsService } from "@/features/leads/services/leads.service";
import type {
  AssignLeadsPayload,
  BulkUpdateLeadsPayload,
  ListLeadsParams,
} from "@/features/leads/types/lead.types";
import type { LeadFormSchema } from "@/features/leads/schemas/lead.schema";

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: ListLeadsParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (uuid: string) => [...leadKeys.details(), uuid] as const,
  formOptions: () => [...leadKeys.all, "form-options"] as const,
  auditTrail: (uuid: string) => [...leadKeys.all, "audit", uuid] as const,
};

export function useLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useLead(uuid: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(uuid ?? ""),
    queryFn: () => leadsService.getByUuid(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useLeadFormOptions() {
  return useQuery({
    queryKey: leadKeys.formOptions(),
    queryFn: () => leadsService.getFormOptions(),
  });
}

export function useLeadAuditTrail(uuid: string | undefined) {
  return useQuery({
    queryKey: leadKeys.auditTrail(uuid ?? ""),
    queryFn: () => leadsService.getAuditTrail(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LeadFormSchema) => leadsService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useUpdateLead(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LeadFormSchema) => leadsService.update(uuid, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => leadsService.remove(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useAssignLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignLeadsPayload) => leadsService.assign(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useBulkUpdateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdateLeadsPayload) =>
      leadsService.bulkUpdate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useImportLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      skipDuplicates,
    }: {
      file: File;
      skipDuplicates?: boolean;
    }) => leadsService.import(file, skipDuplicates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}
