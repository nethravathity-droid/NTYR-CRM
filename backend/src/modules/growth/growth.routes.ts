import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { GrowthController } from "./growth.controller.js";
import { growthService } from "./growth.service.js";
import {
  createAppointmentSchema,
  createCampaignSchema,
  createFormSchema,
  createFunnelSchema,
  createReviewSchema,
  createTemplateSchema,
  createWorkflowSchema,
  deleteTemplateSchema,
  inboxSchema,
  inboxThreadSchema,
  inboxReplySchema,
  listAppointmentsSchema,
  listCampaignsSchema,
  listFormsSchema,
  listFunnelsSchema,
  listReviewsSchema,
  listTemplatesSchema,
  listWorkflowsSchema,
  publicFormSchema,
  runCampaignSchema,
  submitFormSchema,
  updateAppointmentSchema,
  updateCampaignSchema,
  updateFormSchema,
  updateFunnelSchema,
  updateReviewSchema,
  updateTemplateSchema,
  updateWorkflowSchema,
} from "./growth.validation.js";

const growthController = new GrowthController(growthService);
const router = Router();

router.get("/public/forms/:uuid", validate(publicFormSchema), growthController.getPublicForm);
router.post("/public/forms/:uuid/submit", validate(submitFormSchema), growthController.submitPublicForm);

router.use(authenticate);

router.get("/hub", authorize("growth.view"), growthController.hub);
router.get("/inbox", authorize("growth.view"), validate(inboxSchema), growthController.inbox);
router.get("/inbox/thread", authorize("growth.view"), validate(inboxThreadSchema), growthController.inboxThread);
router.post("/inbox/reply", authorize("growth.create"), validate(inboxReplySchema), growthController.inboxReply);

router.get("/templates", authorize("growth.view"), validate(listTemplatesSchema), growthController.listTemplates);
router.post("/templates", authorize("growth.create"), validate(createTemplateSchema), growthController.createTemplate);
router.put(
  "/templates/:uuid",
  authorize("growth.update"),
  validate(updateTemplateSchema),
  growthController.updateTemplate,
);
router.delete(
  "/templates/:uuid",
  authorize("growth.delete"),
  validate(deleteTemplateSchema),
  growthController.deleteTemplate,
);

router.get("/campaigns", authorize("growth.view"), validate(listCampaignsSchema), growthController.listCampaigns);
router.post("/campaigns", authorize("growth.create"), validate(createCampaignSchema), growthController.createCampaign);
router.put(
  "/campaigns/:uuid",
  authorize("growth.update"),
  validate(updateCampaignSchema),
  growthController.updateCampaign,
);
router.post(
  "/campaigns/:uuid/run",
  authorize("growth.update"),
  validate(runCampaignSchema),
  growthController.runCampaign,
);

router.get("/workflows", authorize("growth.view"), validate(listWorkflowsSchema), growthController.listWorkflows);
router.post("/workflows", authorize("growth.create"), validate(createWorkflowSchema), growthController.createWorkflow);
router.put(
  "/workflows/:uuid",
  authorize("growth.update"),
  validate(updateWorkflowSchema),
  growthController.updateWorkflow,
);

router.get("/forms", authorize("growth.view"), validate(listFormsSchema), growthController.listForms);
router.post("/forms", authorize("growth.create"), validate(createFormSchema), growthController.createForm);
router.put("/forms/:uuid", authorize("growth.update"), validate(updateFormSchema), growthController.updateForm);

router.get("/funnels", authorize("growth.view"), validate(listFunnelsSchema), growthController.listFunnels);
router.post("/funnels", authorize("growth.create"), validate(createFunnelSchema), growthController.createFunnel);
router.put("/funnels/:uuid", authorize("growth.update"), validate(updateFunnelSchema), growthController.updateFunnel);

router.get(
  "/appointments",
  authorize("growth.view"),
  validate(listAppointmentsSchema),
  growthController.listAppointments,
);
router.post(
  "/appointments",
  authorize("growth.create"),
  validate(createAppointmentSchema),
  growthController.createAppointment,
);
router.put(
  "/appointments/:uuid",
  authorize("growth.update"),
  validate(updateAppointmentSchema),
  growthController.updateAppointment,
);

router.get("/reviews", authorize("growth.view"), validate(listReviewsSchema), growthController.listReviews);
router.post("/reviews", authorize("growth.create"), validate(createReviewSchema), growthController.createReview);
router.put("/reviews/:uuid", authorize("growth.update"), validate(updateReviewSchema), growthController.updateReview);

export default router;
