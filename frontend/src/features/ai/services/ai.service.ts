import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { AiChatResponse, AiChatRequest } from "@/features/ai/types/ai.types";

export const aiService = {
  async chat(payload: AiChatRequest): Promise<AiChatResponse> {
    const response = await apiClient.post<ApiResponse<AiChatResponse>>("/ai/chat", payload);
    return response.data.data;
  },

  async listConversations(): Promise<unknown> {
    const response = await apiClient.get("/ai/conversations");
    return response.data.data;
  },
};
