import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/features/reports/services/reports.service";
import type { ReportFiltersParams } from "@/features/reports/types/report.types";

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: (params: ReportFiltersParams) => [...reportKeys.all, "dashboard", params] as const,
  leads: (params: ReportFiltersParams) => [...reportKeys.all, "leads", params] as const,
  sales: (params: ReportFiltersParams) => [...reportKeys.all, "sales", params] as const,
  employees: (params: ReportFiltersParams) => [...reportKeys.all, "employees", params] as const,
  followups: (params: ReportFiltersParams) => [...reportKeys.all, "followups", params] as const,
  visits: (params: ReportFiltersParams) => [...reportKeys.all, "visits", params] as const,
  bookings: (params: ReportFiltersParams) => [...reportKeys.all, "bookings", params] as const,
  payments: (params: ReportFiltersParams) => [...reportKeys.all, "payments", params] as const,
};

export function useDashboardReport(params: ReportFiltersParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reportKeys.dashboard(params),
    queryFn: () => reportsService.getDashboard(params),
    enabled: options?.enabled ?? true,
  });
}

export function useLeadReport(params: ReportFiltersParams) {
  return useQuery({ queryKey: reportKeys.leads(params), queryFn: () => reportsService.getLeads(params) });
}

export function useSalesReport(params: ReportFiltersParams) {
  return useQuery({ queryKey: reportKeys.sales(params), queryFn: () => reportsService.getSales(params) });
}

export function useEmployeeReport(params: ReportFiltersParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reportKeys.employees(params),
    queryFn: () => reportsService.getEmployees(params),
    enabled: options?.enabled ?? true,
  });
}

export function useFollowupReport(params: ReportFiltersParams) {
  return useQuery({ queryKey: reportKeys.followups(params), queryFn: () => reportsService.getFollowups(params) });
}

export function useVisitReport(params: ReportFiltersParams) {
  return useQuery({ queryKey: reportKeys.visits(params), queryFn: () => reportsService.getVisits(params) });
}

export function useBookingReport(params: ReportFiltersParams) {
  return useQuery({ queryKey: reportKeys.bookings(params), queryFn: () => reportsService.getBookings(params) });
}

export function usePaymentReport(params: ReportFiltersParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reportKeys.payments(params),
    queryFn: () => reportsService.getPayments(params),
    enabled: options?.enabled ?? true,
  });
}
