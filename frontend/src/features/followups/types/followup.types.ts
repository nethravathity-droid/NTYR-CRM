export type FollowupType = "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "SITE_VISIT";
export type FollowupPriority = "HIGH" | "MEDIUM" | "LOW";
export type FollowupStatus = "PENDING" | "COMPLETED" | "MISSED" | "RESCHEDULED";

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

export type ReminderBefore = 5 | 15 | 30 | 60;

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
  projectInterested: string | null;
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

export interface FollowupFormOptions {
  assignees: FollowupAssignee[];
  leads: FollowupLeadSummary[];
  types: FollowupType[];
  priorities: FollowupPriority[];
  statuses: FollowupStatus[];
  reminderOptions: number[];
}

export interface ListFollowupsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: FollowupStatus;
  priority?: FollowupPriority;
  type?: FollowupType;
  assignedUserId?: number;
  leadId?: number;
  date?: string;
  fromDate?: string;
  toDate?: string;
  upcoming?: boolean;
  overdue?: boolean;
  sortBy?: "followup_date" | "followup_time" | "customer_name" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface FollowupFormValues {
  leadId: number | null;
  customerName: string;
  assignedUserId: number | null;
  followupDate: string;
  followupTime: string;
  type: FollowupType;
  priority: FollowupPriority;
  status: FollowupStatus;
  notes: string;
  reminderBefore: ReminderBefore;
  nextFollowupDate: string;
}

export const FOLLOWUP_TYPE_LABELS: Record<FollowupType, string> = {
  CALL: "Call",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  MEETING: "Meeting",
  SITE_VISIT: "Site Visit",
};

export const FOLLOWUP_PRIORITY_LABELS: Record<FollowupPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const FOLLOWUP_STATUS_LABELS: Record<FollowupStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  MISSED: "Missed",
  RESCHEDULED: "Rescheduled",
};
