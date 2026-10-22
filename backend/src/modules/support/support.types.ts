export type SupportSenderRole = "PLATFORM_SUPER_ADMIN" | "COMPANY_ADMIN";

export interface SupportMessageRecord {
  id: number;
  uuid: string;
  company_id: number;
  sender_user_id: number;
  sender_role: SupportSenderRole;
  sender_name: string;
  body: string;
  is_read_by_super_admin: boolean;
  is_read_by_company_admin: boolean;
  created_at: Date;
}

export interface CompanyThread {
  companyUuid: string;
  companyCode: string;
  companyName: string;
  ownerName: string;
  status: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFrom: SupportSenderRole | null;
  unreadCount: number;
}

export interface ThreadMessage {
  uuid: string;
  senderRole: SupportSenderRole;
  senderName: string;
  body: string;
  createdAt: string;
}
