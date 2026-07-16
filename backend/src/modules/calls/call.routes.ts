import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { CallsController } from "./call.controller.js";
import { callsService } from "./call.service.js";
import {
  createCallSchema,
  deleteCallSchema,
  getCallSchema,
  getCallSummarySchema,
  getCallTimelineSchema,
  listCallsSchema,
  updateCallSchema,
} from "./call.validation.js";

const callsController = new CallsController(callsService);
const router = Router();

router.use(authenticate);

router.get("/form-options", authorize("calls.view"), callsController.getFormOptions);
router.get("/summary", authorize("calls.view"), validate(getCallSummarySchema), callsController.summary);
router.get("/", authorize("calls.view"), validate(listCallsSchema), callsController.list);
router.get("/:uuid/timeline", authorize("calls.view"), validate(getCallTimelineSchema), callsController.getTimeline);
router.get("/:uuid", authorize("calls.view"), validate(getCallSchema), callsController.getByUuid);
router.post("/", authorize("calls.create"), validate(createCallSchema), callsController.create);
router.put("/:uuid", authorize("calls.update"), validate(updateCallSchema), callsController.update);
router.delete("/:uuid", authorize("calls.delete"), validate(deleteCallSchema), callsController.remove);

export default router;
