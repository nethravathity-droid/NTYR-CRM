export type VisitStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface VisitLeadSummary {
  id: number;
  uuid: string;
  leadNumber: string;
  customerName: string;
  mobile: string | null;
}

export interface VisitProjectSummary {
  id: number;
  uuid: string;
  projectName: string;
  projectCode: string;
}

export interface VisitUnitSummary {
  id: number;
  uuid: string;
  unitNumber: string;
}

export interface VisitAssignee {
  id: number;
  uuid: string;
  employeeCode: string;
  displayName: string | null;
}

export interface VisitListItem {
  id: number;
  uuid: string;
  visitNumber: string;
  lead: VisitLeadSummary | null;
  customerName: string;
  mobile: string;
  project: VisitProjectSummary | null;
  unit: VisitUnitSummary | null;
  visitDate: string;
  visitTime: string;
  assignedExecutive: VisitAssignee | null;
  status: VisitStatus;
  transportationRequired: boolean;
  pickupLocation: string | null;
  feedback: string | null;
  rating: number | null;
  nextAction: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VisitDetail extends VisitListItem {
  createdBy: number | null;
  updatedBy: number | null;
}

export interface VisitAuditEntry {
  id: number;
  uuid: string;
  action: string;
  changes: Record<string, unknown> | null;
  performedBy: number | null;
  performerName: string | null;
  createdAt: string;
}

export interface PaginatedVisits {
  visits: VisitListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateVisitData {
  leadId?: number | null;
  customerName: string;
  mobile: string;
  projectId?: number | null;
  unitId?: number | null;
  visitDate: string;
  visitTime: string;
  assignedUserId?: number | null;
  status?: VisitStatus;
  transportationRequired?: boolean;
  pickupLocation?: string | null;
  feedback?: string | null;
  rating?: number | null;
  nextAction?: string | null;
  notes?: string | null;
}

export interface UpdateVisitData extends Partial<CreateVisitData> {}

export interface VisitRecord {
  id: number;
  uuid: string;
  company_id: number;
  visit_number: string;
  lead_id: number | null;
  customer_name: string;
  mobile: string;
  project_id: number | null;
  unit_id: number | null;
  visit_date: string;
  visit_time: string;
  assigned_user_id: number | null;
  status: VisitStatus;
  transportation_required: boolean;
  pickup_location: string | null;
  feedback: string | null;
  rating: number | null;
  next_action: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}
