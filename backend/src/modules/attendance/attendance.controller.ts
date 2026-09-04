import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { AttendanceService } from "./attendance.service.js";
import type {
  attendanceStatsSchema,
  attendanceRecordsSchema,
  createLeaveRequestSchema,
  listLeaveRequestsSchema,
} from "./attendance.validation.js";
import type { z } from "zod";

type StatsRequest = Request & { validated: z.infer<typeof attendanceStatsSchema> };
type RecordsRequest = Request & { validated: z.infer<typeof attendanceRecordsSchema> };
type CreateLeaveRequest = Request & { validated: z.infer<typeof createLeaveRequestSchema> };
type ListLeaveRequest = Request & { validated: z.infer<typeof listLeaveRequestsSchema> };

export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as StatsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId || !userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const stats = await this.attendanceService.getAttendanceStats(companyId, userId, query.startDate, query.endDate);

    res.status(200).json({
      success: true,
      message: "Attendance stats retrieved successfully",
      data: stats,
    });
  });

  listRecords = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as RecordsRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId || !userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const records = await this.attendanceService.listAttendanceRecords(companyId, userId, query.startDate, query.endDate);

    res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: records,
    });
  });

  createLeaveRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateLeaveRequest).validated;
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId || !userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const leaveRequest = await this.attendanceService.createLeaveRequest(companyId, userId, body);

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: leaveRequest,
    });
  });

  listLeaveRequests = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as { user?: { companyId?: number } }).user?.companyId;
    const userId = (req as { user?: { id?: number } }).user?.id;

    if (!companyId || !userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const leaveRequests = await this.attendanceService.listLeaveRequests(companyId, userId);

    res.status(200).json({
      success: true,
      message: "Leave requests retrieved successfully",
      data: leaveRequests,
    });
  });
}
