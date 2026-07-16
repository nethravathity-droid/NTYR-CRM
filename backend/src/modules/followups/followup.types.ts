export type FollowupType = "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "SITE_VISIT";
export type FollowupPriority = "HIGH" | "MEDIUM" | "LOW";
export type FollowupStatus = "PENDING" | "COMPLETED" | "MISSED" | "RESCHEDULED";
export type ReminderBefore = 5 | 15 | 30 | 60;

export interface FollowupLeadSummary {
  id: number;
  uuid: string;
  leadNumber: string;
  customerName: string;
  mobile: string | null;
}

export interface FollowupAssignee {
  id: number;
  uuid: string;
  employeeCode: string;
  displayName: string | null;
}

export interface FollowupListItem {
  id: number;
  uuid: string;
  lead: FollowupLeadSummary | null;
  customerName: string;
  assignedEmployee: FollowupAssignee | null;
  followupDate: string;
  followupTime: string;
  type: FollowupType;
  priority: FollowupPriority;
  status: FollowupStatus;
  notes: string | null;
  reminderBefore: ReminderBefore;
  nextFollowupDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowupDetail extends FollowupListItem {
  createdBy: number | null;
  updatedBy: number | null;
}

export interface PaginatedFollowups {
  followups: FollowupListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFollowupData {
  leadId: number | null;
  customerName: string;
  assignedUserId?: number | null;
  followupDate: string;
  followupTime: string;
  type: FollowupType;
  priority?: FollowupPriority;
  status?: FollowupStatus;
  notes?: string | null;
  reminderBefore?: ReminderBefore;
  nextFollowupDate?: string | null;
}

export interface UpdateFollowupData extends Partial<CreateFollowupData> {}

export interface FollowupRecord {
  id: number;
  uuid: string;
  company_id: number;
  lead_id: number | null;
  customer_name: string;
  assigned_user_id: number | null;
  followup_date: string;
  followup_time: string;
  followup_type: FollowupType;
  priority: FollowupPriority;
  status: FollowupStatus;
  notes: string | null;
  reminder_before: ReminderBefore;
  next_followup_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}
