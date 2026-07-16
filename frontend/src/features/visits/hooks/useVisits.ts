import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitsService } from "@/features/visits/services/visits.service";
import type { ListVisitsParams, VisitFormValues } from "@/features/visits/types/visit.types";

export const visitKeys = {
  all: ["visits"] as const,
  lists: () => [...visitKeys.all, "list"] as const,
  list: (params: ListVisitsParams) => [...visitKeys.lists(), params] as const,
  details: () => [...visitKeys.all, "detail"] as const,
  detail: (uuid: string) => [...visitKeys.details(), uuid] as const,
  audit: (uuid: string) => [...visitKeys.all, "audit", uuid] as const,
  formOptions: () => [...visitKeys.all, "form-options"] as const,
};

export function useVisits(params: ListVisitsParams) {
  return useQuery({
    queryKey: visitKeys.list(params),
    queryFn: () => visitsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useVisit(uuid: string) {
  return useQuery({
    queryKey: visitKeys.detail(uuid),
    queryFn: () => visitsService.getByUuid(uuid),
    enabled: Boolean(uuid),
  });
}

export function useVisitAuditTrail(uuid: string) {
  return useQuery({
    queryKey: visitKeys.audit(uuid),
    queryFn: () => visitsService.getAuditTrail(uuid),
    enabled: Boolean(uuid),
  });
}

export function useVisitFormOptions() {
  return useQuery({
    queryKey: visitKeys.formOptions(),
    queryFn: () => visitsService.getFormOptions(),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: VisitFormValues) => visitsService.create(values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: visitKeys.all }),
  });
}

export function useUpdateVisit(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: VisitFormValues) => visitsService.update(uuid, values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: visitKeys.all }),
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => visitsService.remove(uuid),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: visitKeys.all }),
  });
}

export function useCompleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: { feedback?: string | null; rating?: number | null; nextAction?: string | null; notes?: string | null } }) =>
      visitsService.complete(uuid, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: visitKeys.all }),
  });
}

export function useCancelVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, notes }: { uuid: string; notes?: string | null }) => visitsService.cancel(uuid, { notes }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: visitKeys.all }),
  });
}
