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

export interface AiConversationRecord {
  id: string;
  company_id: number;
  user_id: number;
  title: string;
  created_at: Date;
  updated_at: Date;
}
