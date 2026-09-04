import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorizeRoles } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { SupportController } from "./support.controller.js";
import { supportService } from "./support.service.js";
import {
  listCompanyThreadsSchema,
  listThreadMessagesSchema,
  markThreadReadSchema,
  sendThreadMessageSchema,
  broadcastMessageSchema,
} from "./support.validation.js";

const supportController = new SupportController(supportService);

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("PLATFORM_SUPER_ADMIN"));

router.get(
  "/threads",
  validate(listCompanyThreadsSchema),
  supportController.listThreads,
);

router.get(
  "/threads/:companyUuid",
  validate(listThreadMessagesSchema),
  supportController.listMessages,
);

router.post(
  "/threads/:companyUuid/messages",
  validate(sendThreadMessageSchema),
  supportController.sendMessage,
);

router.patch(
  "/threads/:companyUuid/read",
  validate(markThreadReadSchema),
  supportController.markRead,
);

router.post(
  "/broadcast",
  validate(broadcastMessageSchema),
  supportController.broadcast,
);

export default router;
