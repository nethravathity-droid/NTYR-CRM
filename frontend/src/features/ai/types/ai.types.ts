export type AiChatRole = "user" | "assistant";

export interface AiChatMessage {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
}

export interface AiChatRequest {
  message: string;
  conversationId?: string;
}

export interface AiChatResponse {
  conversationId: string;
  message: AiChatMessage;
  suggestions?: string[];
}
