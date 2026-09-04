import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  AttendanceStats,
  AttendanceRecord,
  LeaveRequest,
  CreateLeaveRequestPayload,
} from "@/features/attendance/types/attendance.types";

export const attendanceService = {
  async getStats(startDate?: string, endDate?: string): Promise<AttendanceStats> {
    const response = await apiClient.get<ApiResponse<AttendanceStats>>("/attendance/stats", {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async listRecords(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>("/attendance/records", {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>("/attendance/leave-requests", payload);
    return response.data.data;
  },

  async listLeaveRequests(): Promise<LeaveRequest[]> {
    const response = await apiClient.get<ApiResponse<LeaveRequest[]>>("/attendance/leave-requests");
    return response.data.data;
  },
};
