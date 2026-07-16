export type VisitStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface VisitListItem {
  id: number;
  uuid: string;
  visitNumber: string;
  lead: { id: number; uuid: string; leadNumber: string; customerName: string; mobile: string | null } | null;
  customerName: string;
  mobile: string;
  project: { id: number; uuid: string; projectName: string; projectCode: string } | null;
  unit: { id: number; uuid: string; unitNumber: string } | null;
  visitDate: string;
  visitTime: string;
  assignedExecutive: { id: number; uuid: string; employeeCode: string; displayName: string | null } | null;
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
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface VisitFormOptions {
  assignees: Array<{ id: number; uuid: string; employeeCode: string; displayName: string | null }>;
  leads: Array<{ id: number; uuid: string; leadNumber: string; customerName: string; mobile: string | null }>;
  projects: Array<{ id: number; uuid: string; projectName: string; projectCode: string }>;
  units: Array<{ id: number; uuid: string; projectId: number; unitNumber: string }>;
  statuses: VisitStatus[];
}

export interface VisitFormValues {
  leadId: number | null;
  customerName: string;
  mobile: string;
  projectId: number | null;
  unitId: number | null;
  visitDate: string;
  visitTime: string;
  assignedUserId: number | null;
  status: VisitStatus;
  transportationRequired: boolean;
  pickupLocation: string;
  feedback: string;
  rating: number | null;
  nextAction: string;
  notes: string;
}

export interface ListVisitsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VisitStatus;
  assignedUserId?: number;
  projectId?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: "visit_date" | "visit_time" | "customer_name" | "created_at" | "status";
  sortOrder?: "asc" | "desc";
}

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export const visitDefaultValues: VisitFormValues = {
  leadId: null,
  customerName: "",
  mobile: "",
  projectId: null,
  unitId: null,
  visitDate: new Date().toISOString().slice(0, 10),
  visitTime: "11:00",
  assignedUserId: null,
  status: "SCHEDULED",
  transportationRequired: false,
  pickupLocation: "",
  feedback: "",
  rating: null,
  nextAction: "",
  notes: "",
};
