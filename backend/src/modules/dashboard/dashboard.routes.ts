import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { DashboardController } from "./dashboard.controller.js";
import { dashboardService } from "./dashboard.service.js";

const dashboardController = new DashboardController(dashboardService);

const router = Router();

router.use(authenticate);

router.get("/summary", dashboardController.getSummary);
router.get("/recent-activities", dashboardController.getRecentActivities);
router.get("/chart", dashboardController.getChart);

export default router;
