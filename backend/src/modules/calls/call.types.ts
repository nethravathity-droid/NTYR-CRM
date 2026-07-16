export type CallDirection = "INCOMING" | "OUTGOING" | "MISSED";
export type CallStatus = "ANSWERED" | "BUSY" | "NO_ANSWER" | "SWITCHED_OFF" | "WRONG_NUMBER";

export interface CallLeadSummary {
  id: number;
  uuid: string;
  leadNumber: string;
  customerName: string;
  mobile: string | null;
}

export interface CallAssignee {
  id: number;
  uuid: string;
  employeeCode: string;
  displayName: string | null;
}

export interface CallFollowupSummary {
  id: number;
  uuid: string;
  followupDate: string;
  followupTime: string;
  status: string;
}

export interface CallListItem {
  id: number;
  uuid: string;
  callNumber: string;
  lead: CallLeadSummary | null;
  customerName: string;
  mobile: string;
  direction: CallDirection;
  callStatus: CallStatus;
  callDate: string;
  callTime: string;
  durationSeconds: number;
  assignedExecutive: CallAssignee | null;
  notes: string | null;
  followup: CallFollowupSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CallDetail extends CallListItem {
  createdBy: number | null;
  updatedBy: number | null;
}

export interface CallAuditEntry {
  id: number;
  uuid: string;
  action: string;
  changes: Record<string, unknown> | null;
  performedBy: number | null;
  performerName: string | null;
  createdAt: string;
}

export interface CallTimelineEntry {
  id: number;
  uuid: string;
  type: "AUDIT" | "CALL";
  title: string;
  description: string | null;
  callStatus: CallStatus | null;
  direction: CallDirection | null;
  durationSeconds: number | null;
  performedBy: string | null;
  createdAt: string;
}

export interface PaginatedCalls {
  calls: CallListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CallDashboardSummary {
  totalCalls: number;
  incomingCalls: number;
  outgoingCalls: number;
  missedCalls: number;
  answeredCalls: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  recentCalls: CallListItem[];
}

export interface CreateCallData {
  leadId?: number | null;
  customerName: string;
  mobile: string;
  direction: CallDirection;
  callStatus: CallStatus;
  callDate: string;
  callTime: string;
  durationSeconds?: number;
  assignedUserId?: number | null;
  notes?: string | null;
  autoCreateFollowup?: boolean;
  nextFollowupDate?: string | null;
  nextFollowupTime?: string | null;
}

export interface UpdateCallData extends Partial<CreateCallData> {}

export interface CallRecord {
  id: number;
  uuid: string;
  company_id: number;
  call_number: string;
  lead_id: number | null;
  customer_name: string;
  mobile: string;
  direction: CallDirection;
  call_status: CallStatus;
  call_date: string;
  call_time: string;
  duration_seconds: number;
  assigned_user_id: number | null;
  notes: string | null;
  followup_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}
