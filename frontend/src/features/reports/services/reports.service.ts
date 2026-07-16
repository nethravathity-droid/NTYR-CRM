import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  BookingReport,
  DashboardReport,
  EmployeeReport,
  ExportFormat,
  FollowupReport,
  LeadReport,
  PaymentReport,
  ReportFiltersParams,
  ReportType,
  SalesReport,
  VisitReport,
} from "@/features/reports/types/report.types";

export const reportsService = {
  async getDashboard(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<DashboardReport>>("/reports/dashboard", { params });
    return response.data.data;
  },

  async getLeads(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<LeadReport>>("/reports/leads", { params });
    return response.data.data;
  },

  async getSales(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<SalesReport>>("/reports/sales", { params });
    return response.data.data;
  },

  async getEmployees(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<EmployeeReport>>("/reports/employees", { params });
    return response.data.data;
  },

  async getFollowups(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<FollowupReport>>("/reports/followups", { params });
    return response.data.data;
  },

  async getVisits(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<VisitReport>>("/reports/visits", { params });
    return response.data.data;
  },

  async getBookings(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<BookingReport>>("/reports/bookings", { params });
    return response.data.data;
  },

  async getPayments(params: ReportFiltersParams = {}) {
    const response = await apiClient.get<ApiResponse<PaymentReport>>("/reports/payments", { params });
    return response.data.data;
  },

  async exportReport(reportType: ReportType, format: ExportFormat, params: ReportFiltersParams = {}) {
    const response = await apiClient.get(`/reports/export/${reportType}`, {
      params: { ...params, format },
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
