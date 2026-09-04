export interface AttendanceStats {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  attendancePercentage: number;
}

export interface AttendanceRecord {
  id: number;
  attendanceDate: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY";
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
}

export interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface CreateLeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}
