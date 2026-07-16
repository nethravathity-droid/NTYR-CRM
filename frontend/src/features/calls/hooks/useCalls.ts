import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callsService } from "@/features/calls/services/calls.service";
import type { CallFormValues, ListCallsParams } from "@/features/calls/types/call.types";

export const callKeys = {
  all: ["calls"] as const,
  lists: () => [...callKeys.all, "list"] as const,
  list: (params: ListCallsParams) => [...callKeys.lists(), params] as const,
  summary: (params: { fromDate?: string; toDate?: string }) => [...callKeys.all, "summary", params] as const,
  details: () => [...callKeys.all, "detail"] as const,
  detail: (uuid: string) => [...callKeys.details(), uuid] as const,
  timeline: (uuid: string) => [...callKeys.all, "timeline", uuid] as const,
  formOptions: () => [...callKeys.all, "form-options"] as const,
};

export function useCalls(params: ListCallsParams) {
  return useQuery({
    queryKey: callKeys.list(params),
    queryFn: () => callsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCallSummary(params: { fromDate?: string; toDate?: string } = {}) {
  return useQuery({
    queryKey: callKeys.summary(params),
    queryFn: () => callsService.getSummary(params),
  });
}

export function useCall(uuid: string) {
  return useQuery({
    queryKey: callKeys.detail(uuid),
    queryFn: () => callsService.getByUuid(uuid),
    enabled: Boolean(uuid),
  });
}

export function useCallTimeline(uuid: string) {
  return useQuery({
    queryKey: callKeys.timeline(uuid),
    queryFn: () => callsService.getTimeline(uuid),
    enabled: Boolean(uuid),
  });
}

export function useCallFormOptions() {
  return useQuery({
    queryKey: callKeys.formOptions(),
    queryFn: () => callsService.getFormOptions(),
  });
}

export function useCreateCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CallFormValues) => callsService.create(values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: callKeys.all }),
  });
}

export function useUpdateCall(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CallFormValues) => callsService.update(uuid, values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: callKeys.all }),
  });
}

export function useDeleteCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => callsService.remove(uuid),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: callKeys.all }),
  });
}
