import { z } from "zod";

export const attendanceStatsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const attendanceRecordsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const createLeaveRequestSchema = z.object({
  body: z.object({
    leaveType: z.string().trim().min(1, "Leave type is required"),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().min(1, "End date is required"),
    reason: z.string().trim().min(1, "Reason is required").max(500),
  }),
});

export const listLeaveRequestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export type AttendanceStatsQuery = z.infer<typeof attendanceStatsSchema>["query"];
export type AttendanceRecordsQuery = z.infer<typeof attendanceRecordsSchema>["query"];
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>["body"];
export type ListLeaveRequestsQuery = z.infer<typeof listLeaveRequestsSchema>["query"];
