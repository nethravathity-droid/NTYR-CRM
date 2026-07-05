export interface DashboardSummary {
  totalEmployees: number;
  totalCompanies: number;
  totalLeads: number;
  totalBookings: number;
  totalRevenue: number;
  pendingFollowups: number;
}

export type DashboardActivityType =
  | "USER_CREATED"
  | "USER_LOGIN"
  | "COMPANY_CREATED"
  | "COMPANY_UPDATED"
  | "LEAD_CREATED"
  | "BOOKING_CREATED"
  | "FOLLOWUP_DUE";

export interface DashboardRecentActivity {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  occurredAt: Date;
  actorName: string | null;
  referenceId: string | null;
}

export type DashboardChartMetric =
  | "leads"
  | "bookings"
  | "revenue"
  | "employees";

export type DashboardChartRange = "7d" | "30d" | "6m" | "12m";

export interface DashboardChartDataset {
  label: string;
  data: number[];
}

export interface DashboardChart {
  metric: DashboardChartMetric;
  range: DashboardChartRange;
  labels: string[];
  datasets: DashboardChartDataset[];
}

export interface DashboardContext {
  companyId: number;
  companyCode: string;
  isPlatformScope: boolean;
}

export interface UserActivityRecord {
  uuid: string;
  display_name: string | null;
  first_name: string;
  last_name: string | null;
  employee_code: string;
  created_at: Date;
  last_login_at: Date | null;
}

export interface CompanyActivityRecord {
  uuid: string;
  company_code: string;
  company_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmployeeGrowthRecord {
  period: string;
  count: string;
}
