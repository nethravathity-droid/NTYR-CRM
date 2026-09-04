import type { Knex } from "knex";
import type { AttendanceRecord, LeaveRequest } from "./attendance.types.js";

export class AttendanceRepository {
  constructor(private readonly db: Knex) {}

  async createAttendanceRecord(data: {
    companyId: number;
    userId: number;
    attendanceDate: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }): Promise<AttendanceRecord> {
    const [row] = await this.db("attendance_records")
      .insert({
        company_id: data.companyId,
        user_id: data.userId,
        attendance_date: data.attendanceDate,
        status: data.status,
        check_in_time: data.checkInTime ?? null,
        check_out_time: data.checkOutTime ?? null,
        notes: data.notes ?? null,
      })
      .returning("*");

    return row as AttendanceRecord;
  }

  async listAttendanceRecords(companyId: number, userId: number, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    const qb = this.db<AttendanceRecord>("attendance_records")
      .where({ company_id: companyId, user_id: userId })
      .whereNull("deleted_at")
      .orderBy("attendance_date", "desc");

    if (startDate) {
      qb.where("attendance_date", ">=", startDate);
    }
    if (endDate) {
      qb.where("attendance_date", "<=", endDate);
    }

    return qb;
  }

  async getAttendanceStats(companyId: number, userId: number, startDate?: string, endDate?: string): Promise<{
    totalWorkingDays: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    halfDays: number;
    attendancePercentage: number;
  }> {
    const qb = this.db("attendance_records")
      .where({ company_id: companyId, user_id: userId })
      .whereNull("deleted_at");

    if (startDate) {
      qb.where("attendance_date", ">=", startDate);
    }
    if (endDate) {
      qb.where("attendance_date", "<=", endDate);
    }

    const rows = await qb.select("status");

    const totalWorkingDays = rows.length;
    const presentDays = rows.filter((r) => r.status === "PRESENT").length;
    const absentDays = rows.filter((r) => r.status === "ABSENT").length;
    const leaveDays = rows.filter((r) => r.status === "LEAVE").length;
    const halfDays = rows.filter((r) => r.status === "HALF_DAY").length;
    const attendancePercentage = totalWorkingDays > 0 ? Math.round(((presentDays + halfDays * 0.5) / totalWorkingDays) * 100) : 0;

    return {
      totalWorkingDays,
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      attendancePercentage,
    };
  }

  async createLeaveRequest(data: {
    companyId: number;
    userId: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<LeaveRequest> {
    const [row] = await this.db("leave_requests")
      .insert({
        company_id: data.companyId,
        user_id: data.userId,
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
        status: "PENDING",
      })
      .returning("*");

    return row as LeaveRequest;
  }

  async listLeaveRequests(companyId: number, userId: number): Promise<LeaveRequest[]> {
    const rows = await this.db<LeaveRequest>("leave_requests")
      .where({ company_id: companyId, user_id: userId })
      .orderBy("created_at", "desc")
      .select("*");

    return rows;
  }
}
