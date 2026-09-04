import { db } from "../../database/knex.js";
import { AppError } from "../../common/errors/AppError.js";
import { AttendanceRepository } from "./attendance.repository.js";
import type { AttendanceStats, CreateAttendanceInput, CreateLeaveRequestInput } from "./attendance.types.js";

export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async getAttendanceStats(companyId: number, userId: number, startDate?: string, endDate?: string): Promise<AttendanceStats> {
    return this.attendanceRepository.getAttendanceStats(companyId, userId, startDate, endDate);
  }

  async listAttendanceRecords(companyId: number, userId: number, startDate?: string, endDate?: string) {
    return this.attendanceRepository.listAttendanceRecords(companyId, userId, startDate, endDate);
  }

  async createLeaveRequest(companyId: number, userId: number, input: CreateLeaveRequestInput) {
    if (!input.leaveType || !input.startDate || !input.endDate || !input.reason) {
      throw new AppError(400, "Leave type, dates, and reason are required");
    }

    return this.attendanceRepository.createLeaveRequest({
      companyId,
      userId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason,
    });
  }

  async listLeaveRequests(companyId: number, userId: number) {
    return this.attendanceRepository.listLeaveRequests(companyId, userId);
  }
}

export const attendanceService = new AttendanceService(new AttendanceRepository(db));
