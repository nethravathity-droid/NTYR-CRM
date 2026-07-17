export type LeadPriority = "COLD" | "WARM" | "HOT";

export type LeadStatus =
  | "NEW"
  | "ASSIGNED"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "VISIT_SCHEDULED"
  | "VISITED"
  | "NEGOTIATION"
  | "BOOKED"
  | "LOST";

export type LeadAuditAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "ASSIGNED"
  | "BULK_UPDATED"
  | "IMPORTED";

export interface LeadAssignee {
  id: number;
  uuid: string;
  employeeCode: string;
  displayName: string | null;
}

export interface LeadListItem {
  id: number;
  uuid: string;
  leadNumber: string;
  customerName: string;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  projectInterested: string | null;
  budget: number | null;
  propertyType: string | null;
  leadSource: string | null;
  campaign: string | null;
  city: string | null;
  priority: LeadPriority;
  status: LeadStatus;
  assignedEmployee: LeadAssignee | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDetail extends LeadListItem {
  notes: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface LeadAuditEntry {
  id: number;
  uuid: string;
  action: LeadAuditAction;
  changes: Record<string, unknown> | null;
  performedBy: {
    id: number;
    displayName: string | null;
  } | null;
  createdAt: string;
}

export interface DuplicateLeadMatch {
  uuid: string;
  leadNumber: string;
  customerName: string;
  mobile: string;
  email: string | null;
}

export interface PaginatedLeads {
  leads: LeadListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedUserId?: number;
  leadSource?: string;
  propertyType?: string;
  city?: string;
  campaign?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?:
    | "created_at"
    | "updated_at"
    | "customer_name"
    | "lead_number"
    | "budget"
    | "status"
    | "priority";
  sortOrder?: "asc" | "desc";
}

export interface LeadFormOptions {
  assignees: LeadAssignee[];
  statuses: LeadStatus[];
  priorities: LeadPriority[];
  leadSources: string[];
  propertyTypes: string[];
}

export interface ImportLeadsResult {
  imported: number;
  skipped: number;
  duplicates: Array<{
    row: number;
    reason: string;
    existingLead?: DuplicateLeadMatch;
  }>;
  errors: Array<{ row: number; message: string }>;
}

export interface AssignLeadsPayload {
  leadUuids: string[];
  assignedUserId: number;
}

export interface BulkUpdateLeadsPayload {
  leadUuids: string[];
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedUserId?: number | null;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow Up",
  VISIT_SCHEDULED: "Visit Scheduled",
  VISITED: "Visited",
  NEGOTIATION: "Negotiation",
  BOOKED: "Booked",
  LOST: "Lost",
};

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold",
};
