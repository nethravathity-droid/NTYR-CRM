import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followupsService } from "@/features/followups/services/followups.service";
import type { FollowupFormValues, ListFollowupsParams } from "@/features/followups/types/followup.types";

export const followupKeys = {
  all: ["followups"] as const,
  lists: () => [...followupKeys.all, "list"] as const,
  list: (params: ListFollowupsParams) => [...followupKeys.lists(), params] as const,
  today: () => [...followupKeys.all, "today"] as const,
  overdue: () => [...followupKeys.all, "overdue"] as const,
  details: () => [...followupKeys.all, "detail"] as const,
  detail: (uuid: string) => [...followupKeys.details(), uuid] as const,
  formOptions: () => [...followupKeys.all, "form-options"] as const,
};

export function useFollowups(params: ListFollowupsParams) {
  return useQuery({
    queryKey: followupKeys.list(params),
    queryFn: () => followupsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useTodayFollowups(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: followupKeys.today(),
    queryFn: () => followupsService.getToday(),
    enabled: options?.enabled ?? true,
  });
}

export function useOverdueFollowups(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: followupKeys.overdue(),
    queryFn: () => followupsService.getOverdue(),
    enabled: options?.enabled ?? true,
  });
}

export function useFollowupFormOptions() {
  return useQuery({
    queryKey: followupKeys.formOptions(),
    queryFn: () => followupsService.getFormOptions(),
  });
}

export function useCreateFollowup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: FollowupFormValues) => followupsService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followupKeys.all });
    },
  });
}

export function useUpdateFollowup(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: FollowupFormValues) => followupsService.update(uuid, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followupKeys.all });
    },
  });
}

export function useDeleteFollowup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => followupsService.remove(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followupKeys.all });
    },
  });
}

export function useCompleteFollowup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => followupsService.complete(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followupKeys.all });
    },
  });
}

export function useRescheduleFollowup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: { followupDate: string; followupTime: string; notes?: string | null };
    }) => followupsService.reschedule(uuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followupKeys.all });
    },
  });
}
