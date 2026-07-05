export type LeadPriorityDb = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type LeadPriorityApi = "COLD" | "WARM" | "HOT";

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

export interface LeadRecord {
  id: number;
  uuid: string;
  company_id: number;
  lead_number: string;
  customer_name: string;
  mobile: string;
  alternate_mobile: string | null;
  email: string | null;
  project_interested: string | null;
  budget: string | null;
  property_type: string | null;
  lead_source: string | null;
  campaign: string | null;
  city: string | null;
  assigned_user_id: number | null;
  priority: LeadPriorityDb;
  status: LeadStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

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
  priority: LeadPriorityApi;
  status: LeadStatus;
  assignedEmployee: LeadAssignee | null;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}

export interface DuplicateLeadMatch {
  uuid: string;
  leadNumber: string;
  customerName: string;
  mobile: string;
  email: string | null;
}

export interface PaginatedLeadsResult {
  leads: LeadListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLeadData {
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  projectInterested?: string | null;
  budget?: number | null;
  propertyType?: string | null;
  leadSource?: string | null;
  campaign?: string | null;
  city?: string | null;
  assignedUserId?: number | null;
  priority?: LeadPriorityApi;
  status?: LeadStatus;
  notes?: string | null;
}

export interface UpdateLeadData {
  customerName?: string;
  mobile?: string;
  alternateMobile?: string | null;
  email?: string | null;
  projectInterested?: string | null;
  budget?: number | null;
  propertyType?: string | null;
  leadSource?: string | null;
  campaign?: string | null;
  city?: string | null;
  assignedUserId?: number | null;
  priority?: LeadPriorityApi;
  status?: LeadStatus;
  notes?: string | null;
}

export interface ListLeadsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriorityApi;
  assignedUserId?: number;
  leadSource?: string;
  propertyType?: string;
  city?: string;
  campaign?: string;
  sortBy:
    | "created_at"
    | "updated_at"
    | "customer_name"
    | "lead_number"
    | "budget"
    | "status"
    | "priority";
  sortOrder: "asc" | "desc";
}

export interface LeadFormOptions {
  assignees: LeadAssignee[];
  statuses: LeadStatus[];
  priorities: LeadPriorityApi[];
  leadSources: string[];
  propertyTypes: string[];
}

export interface ImportLeadRow {
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  projectInterested?: string | null;
  budget?: number | null;
  propertyType?: string | null;
  leadSource?: string | null;
  campaign?: string | null;
  city?: string | null;
  assignedUserId?: number | null;
  priority?: LeadPriorityApi;
  status?: LeadStatus;
  notes?: string | null;
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

export interface BulkUpdateLeadsResult {
  updated: number;
  failed: number;
}

export interface AssignLeadsResult {
  assigned: number;
  failed: number;
}

export const PRIORITY_API_TO_DB: Record<LeadPriorityApi, LeadPriorityDb> = {
  COLD: "LOW",
  WARM: "MEDIUM",
  HOT: "URGENT",
};

export const PRIORITY_DB_TO_API: Record<LeadPriorityDb, LeadPriorityApi> = {
  LOW: "COLD",
  MEDIUM: "WARM",
  HIGH: "HOT",
  URGENT: "HOT",
};
