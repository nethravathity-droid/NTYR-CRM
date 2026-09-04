import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/utils/validate.js";
import { AttendanceController } from "./attendance.controller.js";
import { attendanceService } from "./attendance.service.js";
import {
  attendanceStatsSchema,
  attendanceRecordsSchema,
  createLeaveRequestSchema,
  listLeaveRequestsSchema,
} from "./attendance.validation.js";

const attendanceController = new AttendanceController(attendanceService);

const router = Router();

router.use(authenticate);

router.get("/stats", validate(attendanceStatsSchema), attendanceController.getStats);
router.get("/records", validate(attendanceRecordsSchema), attendanceController.listRecords);
router.post("/leave-requests", validate(createLeaveRequestSchema), attendanceController.createLeaveRequest);
router.get("/leave-requests", validate(listLeaveRequestsSchema), attendanceController.listLeaveRequests);

export default router;
