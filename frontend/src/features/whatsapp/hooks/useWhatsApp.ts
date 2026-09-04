import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappService } from "@/features/whatsapp/services/whatsapp.service";
import type { CreateWhatsAppMessagePayload, ListWhatsAppMessagesQuery } from "@/features/whatsapp/types/whatsapp.types";

export const whatsappKeys = {
  all: ["whatsapp"] as const,
  messages: () => [...whatsappKeys.all, "messages"] as const,
  message: (uuid: string) => [...whatsappKeys.all, "message", uuid] as const,
};

export function useWhatsAppMessages(params: ListWhatsAppMessagesQuery) {
  return useQuery({
    queryKey: whatsappKeys.messages(),
    queryFn: () => whatsappService.listMessages(params),
  });
}

export function useWhatsAppMessage(uuid: string | undefined) {
  return useQuery({
    queryKey: whatsappKeys.message(uuid ?? ""),
    queryFn: () => whatsappService.getMessage(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWhatsAppMessagePayload) => whatsappService.sendMessage(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: whatsappKeys.all });
    },
  });
}

export function useMarkWhatsAppSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, externalId }: { uuid: string; externalId?: string }) =>
      whatsappService.markSent(uuid, externalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: whatsappKeys.all });
    },
  });
}

export function useMarkWhatsAppDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => whatsappService.markDelivered(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: whatsappKeys.all });
    },
  });
}

export function useMarkWhatsAppRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => whatsappService.markRead(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: whatsappKeys.all });
    },
  });
}

export function useDeleteWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => whatsappService.deleteMessage(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: whatsappKeys.all });
    },
  });
}
