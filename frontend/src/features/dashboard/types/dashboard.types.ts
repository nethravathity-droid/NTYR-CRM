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

  occurredAt: string;

  actorName: string | null;

  referenceId: string | null;

}



export type DashboardChartMetric = "leads" | "bookings" | "revenue" | "employees";

export type DashboardChartRange = "7d" | "30d" | "6m" | "12m";



export interface DashboardChart {

  metric: DashboardChartMetric;

  range: DashboardChartRange;

  labels: string[];

  datasets: Array<{ label: string; data: number[] }>;

}


