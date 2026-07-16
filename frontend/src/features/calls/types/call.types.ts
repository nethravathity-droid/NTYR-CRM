export type CallDirection = "INCOMING" | "OUTGOING" | "MISSED";
export type CallStatus = "ANSWERED" | "BUSY" | "NO_ANSWER" | "SWITCHED_OFF" | "WRONG_NUMBER";

export interface CallListItem {
  id: number;
  uuid: string;
  callNumber: string;
  lead: { id: number; uuid: string; leadNumber: string; customerName: string; mobile: string | null } | null;
  customerName: string;
  mobile: string;
  direction: CallDirection;
  callStatus: CallStatus;
  callDate: string;
  callTime: string;
  durationSeconds: number;
  assignedExecutive: { id: number; uuid: string; employeeCode: string; displayName: string | null } | null;
  notes: string | null;
  followup: { id: number; uuid: string; followupDate: string; followupTime: string; status: string } | null;
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
  pagination: { page: number; limit: number; total: number; totalPages: number };
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

export interface CallFormOptions {
  assignees: Array<{ id: number; uuid: string; employeeCode: string; displayName: string | null }>;
  leads: Array<{ id: number; uuid: string; leadNumber: string; customerName: string; mobile: string | null }>;
  directions: CallDirection[];
  callStatuses: CallStatus[];
}

export interface CallFormValues {
  leadId: number | null;
  customerName: string;
  mobile: string;
  direction: CallDirection;
  callStatus: CallStatus;
  callDate: string;
  callTime: string;
  durationSeconds: number;
  assignedUserId: number | null;
  notes: string;
  autoCreateFollowup: boolean;
  nextFollowupDate: string;
  nextFollowupTime: string;
}

export interface ListCallsParams {
  page?: number;
  limit?: number;
  search?: string;
  direction?: CallDirection;
  callStatus?: CallStatus;
  assignedUserId?: number;
  leadId?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: "call_date" | "call_time" | "customer_name" | "created_at" | "duration_seconds";
  sortOrder?: "asc" | "desc";
}

export const CALL_DIRECTION_LABELS: Record<CallDirection, string> = {
  INCOMING: "Incoming",
  OUTGOING: "Outgoing",
  MISSED: "Missed",
};

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  ANSWERED: "Answered",
  BUSY: "Busy",
  NO_ANSWER: "No Answer",
  SWITCHED_OFF: "Switched Off",
  WRONG_NUMBER: "Wrong Number",
};

export function formatCallDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function buildTelLink(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

export function getDefaultCallFormValues(): CallFormValues {
  const now = new Date();
  return {
    leadId: null,
    customerName: "",
    mobile: "",
    direction: "OUTGOING",
    callStatus: "ANSWERED",
    callDate: now.toISOString().slice(0, 10),
    callTime: now.toTimeString().slice(0, 5),
    durationSeconds: 0,
    assignedUserId: null,
    notes: "",
    autoCreateFollowup: false,
    nextFollowupDate: "",
    nextFollowupTime: "",
  };
}

export function mapCallToFormValues(call: CallDetail): CallFormValues {
  return {
    leadId: call.lead?.id ?? null,
    customerName: call.customerName,
    mobile: call.mobile,
    direction: call.direction,
    callStatus: call.callStatus,
    callDate: call.callDate,
    callTime: call.callTime.slice(0, 5),
    durationSeconds: call.durationSeconds,
    assignedUserId: call.assignedExecutive?.id ?? null,
    notes: call.notes ?? "",
    autoCreateFollowup: false,
    nextFollowupDate: "",
    nextFollowupTime: "",
  };
}
