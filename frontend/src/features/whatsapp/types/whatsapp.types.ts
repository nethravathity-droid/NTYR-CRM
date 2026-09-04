export type WhatsAppDirection = "inbound" | "outbound";
export type WhatsAppStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface WhatsAppMessage {
  uuid: string;
  customerName: string;
  customerMobile: string;
  direction: WhatsAppDirection;
  status: WhatsAppStatus;
  templateId: string | null;
  body: string;
  mediaUrl: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface WhatsAppMessageListResponse {
  messages: WhatsAppMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateWhatsAppMessagePayload {
  customerName: string;
  customerMobile: string;
  leadId?: number;
  templateId?: string;
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppSettings {
  phoneNumberId: string;
  businessNumber: string;
  provider: "whatsapp_cloud" | "twilio" | "custom";
  enabled: boolean;
}

export interface ListWhatsAppMessagesQuery {
  page?: number;
  limit?: number;
  search?: string;
  direction?: WhatsAppDirection;
  status?: WhatsAppStatus;
  startDate?: string;
  endDate?: string;
  leadId?: number;
}
