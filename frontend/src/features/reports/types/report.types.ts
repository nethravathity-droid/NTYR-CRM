export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type ReportType =
  | "dashboard"
  | "leads"
  | "sales"
  | "employees"
  | "followups"
  | "visits"
  | "bookings"
  | "payments";

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ReportFiltersParams {
  period?: ReportPeriod;
  fromDate?: string;
  toDate?: string;
  projectId?: number;
  branchId?: number;
  assignedUserId?: number;
  leadSource?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BreakdownItem {
  label: string;
  value: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardKpis {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  followupsDue: number;
  siteVisits: number;
  bookings: number;
  revenue: number;
  collection: number;
  outstanding: number;
}

export interface DashboardReport {
  kpis: DashboardKpis;
  leadSourceChart: BreakdownItem[];
  leadStatusFunnel: BreakdownItem[];
  salesTrend: ChartData;
  revenueTrend: ChartData;
  bookingTrend: ChartData;
  paymentCollection: ChartData;
}

export interface PaginatedReportRows {
  rows: Array<Record<string, string | number | null>>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface LeadReport {
  summary: { total: number; active: number; converted: number; lost: number; conversionRate: number };
  leadSourceChart: BreakdownItem[];
  leadStatusFunnel: BreakdownItem[];
  trend: ChartData;
  rows: PaginatedReportRows;
}

export interface SalesReport {
  summary: { totalBookings: number; approvedBookings: number; totalValue: number; averageValue: number };
  trend: ChartData;
  byProject: BreakdownItem[];
  rows: PaginatedReportRows;
}

export interface EmployeePerformanceItem {
  userId: number;
  employeeCode: string;
  displayName: string | null;
  leadsAssigned: number;
  followupsCompleted: number;
  visitsCompleted: number;
  bookingsClosed: number;
  revenueCollected: number;
}

export interface EmployeeReport {
  performance: EmployeePerformanceItem[];
  chart: ChartData;
}

export interface FollowupReport {
  summary: { total: number; pending: number; completed: number; missed: number };
  byType: BreakdownItem[];
  trend: ChartData;
  rows: PaginatedReportRows;
}

export interface VisitReport {
  summary: { total: number; scheduled: number; completed: number; cancelled: number; noShow: number };
  byStatus: BreakdownItem[];
  trend: ChartData;
  rows: PaginatedReportRows;
}

export interface BookingReport {
  summary: { total: number; approved: number; pendingApproval: number; totalValue: number };
  byStatus: BreakdownItem[];
  trend: ChartData;
  rows: PaginatedReportRows;
}

export interface PaymentReport {
  summary: { totalCollected: number; totalOutstanding: number; totalOverdue: number; paidCount: number; pendingCount: number };
  byType: BreakdownItem[];
  byMode: BreakdownItem[];
  trend: ChartData;
  rows: PaginatedReportRows;
}

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  custom: "Custom Range",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
