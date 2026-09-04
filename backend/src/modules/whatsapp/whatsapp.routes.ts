import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/utils/validate.js";
import { WhatsAppController } from "./whatsapp.controller.js";
import { whatsappService } from "./whatsapp.service.js";
import {
  CreateWhatsAppMessageSchema,
  ListWhatsAppMessagesSchema,
  WhatsAppMessageParamsSchema,
} from "./whatsapp.validation.js";

const whatsappController = new WhatsAppController(whatsappService);

const router = Router();

router.use(authenticate);

router.get(
  "/messages",
  validate(ListWhatsAppMessagesSchema),
  whatsappController.listMessages,
);

router.post(
  "/messages",
  validate(CreateWhatsAppMessageSchema),
  whatsappController.sendMessage,
);

router.get(
  "/messages/:uuid",
  validate(WhatsAppMessageParamsSchema),
  whatsappController.getMessage,
);

router.patch(
  "/messages/:uuid/sent",
  validate(WhatsAppMessageParamsSchema),
  whatsappController.markSent,
);

router.patch(
  "/messages/:uuid/delivered",
  validate(WhatsAppMessageParamsSchema),
  whatsappController.markDelivered,
);

router.patch(
  "/messages/:uuid/read",
  validate(WhatsAppMessageParamsSchema),
  whatsappController.markRead,
);

router.delete(
  "/messages/:uuid",
  validate(WhatsAppMessageParamsSchema),
  whatsappController.deleteMessage,
);

export default router;
