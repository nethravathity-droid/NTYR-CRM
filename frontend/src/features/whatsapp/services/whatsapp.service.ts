import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CreateWhatsAppMessagePayload,
  ListWhatsAppMessagesQuery,
  WhatsAppMessage,
  WhatsAppMessageListResponse,
} from "@/features/whatsapp/types/whatsapp.types";

export const whatsappService = {
  async listMessages(params: ListWhatsAppMessagesQuery): Promise<WhatsAppMessageListResponse> {
    const response = await apiClient.get<ApiResponse<WhatsAppMessageListResponse>>("/whatsapp/messages", {
      params,
    });
    return response.data.data;
  },

  async sendMessage(payload: CreateWhatsAppMessagePayload): Promise<{ message: WhatsAppMessage }> {
    const response = await apiClient.post<ApiResponse<{ message: WhatsAppMessage }>>("/whatsapp/messages", payload);
    return response.data.data;
  },

  async getMessage(uuid: string): Promise<{ message: WhatsAppMessage }> {
    const response = await apiClient.get<ApiResponse<{ message: WhatsAppMessage }>>(`/whatsapp/messages/${uuid}`);
    return response.data.data;
  },

  async markSent(uuid: string, externalId?: string): Promise<void> {
    await apiClient.patch(`/whatsapp/messages/${uuid}/sent`, { externalId });
  },

  async markDelivered(uuid: string): Promise<void> {
    await apiClient.patch(`/whatsapp/messages/${uuid}/delivered`);
  },

  async markRead(uuid: string): Promise<void> {
    await apiClient.patch(`/whatsapp/messages/${uuid}/read`);
  },

  async deleteMessage(uuid: string): Promise<void> {
    await apiClient.delete(`/whatsapp/messages/${uuid}`);
  },
};
