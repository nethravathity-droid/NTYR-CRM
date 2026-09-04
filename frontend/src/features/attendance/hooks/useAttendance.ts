import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/features/attendance/services/attendance.service";
import type { CreateLeaveRequestPayload } from "@/features/attendance/types/attendance.types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  stats: () => [...attendanceKeys.all, "stats"] as const,
  records: () => [...attendanceKeys.all, "records"] as const,
  leaveRequests: () => [...attendanceKeys.all, "leave-requests"] as const,
};

export function useAttendanceStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...attendanceKeys.stats(), startDate, endDate],
    queryFn: () => attendanceService.getStats(startDate, endDate),
  });
}

export function useAttendanceRecords(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...attendanceKeys.records(), startDate, endDate],
    queryFn: () => attendanceService.listRecords(startDate, endDate),
  });
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: attendanceKeys.leaveRequests(),
    queryFn: () => attendanceService.listLeaveRequests(),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => attendanceService.createLeaveRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
