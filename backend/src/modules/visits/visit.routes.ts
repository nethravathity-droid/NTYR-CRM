import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { VisitsController } from "./visit.controller.js";
import { visitsService } from "./visit.service.js";
import {
  calendarVisitsSchema,
  cancelVisitSchema,
  completeVisitSchema,
  createVisitSchema,
  deleteVisitSchema,
  getVisitAuditSchema,
  getVisitSchema,
  listVisitsSchema,
  updateVisitSchema,
} from "./visit.validation.js";

const visitsController = new VisitsController(visitsService);
const router = Router();

router.use(authenticate);

router.get("/form-options", authorize("visits.view"), visitsController.getFormOptions);
router.get("/calendar", authorize("visits.view"), validate(calendarVisitsSchema), visitsController.calendar);
router.get("/", authorize("visits.view"), validate(listVisitsSchema), visitsController.list);
router.get("/:uuid/audit-trail", authorize("visits.view"), validate(getVisitAuditSchema), visitsController.getAuditTrail);
router.get("/:uuid", authorize("visits.view"), validate(getVisitSchema), visitsController.getByUuid);
router.post("/", authorize("visits.create"), validate(createVisitSchema), visitsController.create);
router.put("/:uuid", authorize("visits.update"), validate(updateVisitSchema), visitsController.update);
router.delete("/:uuid", authorize("visits.delete"), validate(deleteVisitSchema), visitsController.remove);
router.patch("/:uuid/complete", authorize("visits.update"), validate(completeVisitSchema), visitsController.complete);
router.patch("/:uuid/cancel", authorize("visits.update"), validate(cancelVisitSchema), visitsController.cancel);

export default router;
