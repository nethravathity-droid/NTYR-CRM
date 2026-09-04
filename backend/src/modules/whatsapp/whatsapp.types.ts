export type WhatsAppDirection = "inbound" | "outbound";
export type WhatsAppStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface WhatsAppMessageRecord {
  id: number;
  uuid: string;
  company_id: number;
  user_id: number | null;
  lead_id: number | null;
  customer_name: string;
  customer_mobile: string;
  direction: WhatsAppDirection;
  status: WhatsAppStatus;
  template_id: string | null;
  body: string;
  media_url: string | null;
  external_id: string | null;
  error_message: string | null;
  sent_at: Date | null;
  delivered_at: Date | null;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface WhatsAppMessageResponse {
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

export interface CreateWhatsAppMessageInput {
  companyId: number;
  userId?: number;
  leadId?: number;
  customerName: string;
  customerMobile: string;
  direction?: WhatsAppDirection;
  status?: WhatsAppStatus;
  templateId?: string;
  body: string;
  mediaUrl?: string;
  externalId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
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
