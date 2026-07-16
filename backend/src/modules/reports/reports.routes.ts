import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { ReportsController } from "./reports.controller.js";
import { reportsService } from "./reports.service.js";
import { exportReportSchema, reportFiltersSchema } from "./reports.validation.js";

const reportsController = new ReportsController(reportsService);
const router = Router();

router.use(authenticate);

router.get("/dashboard", authorize("reports.view"), validate(reportFiltersSchema), reportsController.dashboard);
router.get("/leads", authorize("reports.view"), validate(reportFiltersSchema), reportsController.leads);
router.get("/sales", authorize("reports.view"), validate(reportFiltersSchema), reportsController.sales);
router.get("/employees", authorize("reports.view"), validate(reportFiltersSchema), reportsController.employees);
router.get("/followups", authorize("reports.view"), validate(reportFiltersSchema), reportsController.followups);
router.get("/visits", authorize("reports.view"), validate(reportFiltersSchema), reportsController.visits);
router.get("/bookings", authorize("reports.view"), validate(reportFiltersSchema), reportsController.bookings);
router.get("/payments", authorize("reports.view"), validate(reportFiltersSchema), reportsController.payments);
router.get("/export/:reportType", authorize("reports.export"), validate(exportReportSchema), reportsController.exportReport);

export default router;
