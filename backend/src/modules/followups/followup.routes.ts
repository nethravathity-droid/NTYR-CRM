import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { FollowupsController } from "./followup.controller.js";
import { followupsService } from "./followup.service.js";
import {
  completeFollowupSchema,
  calendarFollowupsSchema,
  createFollowupSchema,
  deleteFollowupSchema,
  getFollowupSchema,
  listFollowupsSchema,
  rescheduleFollowupSchema,
  updateFollowupSchema,
} from "./followup.validation.js";

const followupsController = new FollowupsController(followupsService);
const router = Router();

router.use(authenticate);

router.get("/", authorize("leads.view"), validate(listFollowupsSchema), followupsController.list);
router.get("/calendar", authorize("leads.view"), validate(calendarFollowupsSchema), followupsController.calendar);
router.get("/today", authorize("leads.view"), followupsController.getToday);
router.get("/overdue", authorize("leads.view"), followupsController.getOverdue);
router.get("/form-options", authorize("leads.view"), followupsController.getFormOptions);
router.get("/:uuid", authorize("leads.view"), validate(getFollowupSchema), followupsController.getByUuid);
router.post("/", authorize("leads.create"), validate(createFollowupSchema), followupsController.create);
router.put("/:uuid", authorize("leads.update"), validate(updateFollowupSchema), followupsController.update);
router.delete("/:uuid", authorize("leads.delete"), validate(deleteFollowupSchema), followupsController.remove);
router.patch("/:uuid/complete", authorize("leads.update"), validate(completeFollowupSchema), followupsController.complete);
router.patch("/:uuid/reschedule", authorize("leads.update"), validate(rescheduleFollowupSchema), followupsController.reschedule);

export default router;
