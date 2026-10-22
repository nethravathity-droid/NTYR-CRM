import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as growthService from "@/features/growth/services/growth.service";
import type { GrowthSection } from "@/features/growth/types/growth.types";

const keys = {
  hub: ["growth", "hub"] as const,
  list: (section: GrowthSection) => ["growth", section] as const,
  inbox: ["growth", "inbox"] as const,
};

export function useGrowthHub() {
  return useQuery({ queryKey: keys.hub, queryFn: growthService.getGrowthHub });
}

export function useGrowthList<T>(section: GrowthSection, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: keys.list(section),
    queryFn: () => growthService.listGrowthResource<T>(section),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateGrowthItem(section: GrowthSection) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => growthService.createGrowthResource(section, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.list(section) });
      void queryClient.invalidateQueries({ queryKey: keys.hub });
    },
  });
}

export function useRunCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => growthService.runCampaign(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.list("campaigns") });
      void queryClient.invalidateQueries({ queryKey: keys.hub });
    },
  });
}

export function useGrowthInbox() {
  return useQuery({ queryKey: keys.inbox, queryFn: () => growthService.listInboxThreads() });
}

export function useInboxThread(channel: string | null, recipient: string | null) {
  return useQuery({
    queryKey: ["growth", "inbox-thread", channel, recipient],
    queryFn: () => growthService.getInboxThreadMessages(channel!, recipient!),
    enabled: Boolean(channel && recipient),
  });
}

export function useInboxReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: growthService.replyInbox,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.inbox });
      void queryClient.invalidateQueries({ queryKey: ["growth", "inbox-thread"] });
    },
  });
}
