import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/utils/validate.js";
import { AiController } from "./ai.controller.js";
import { aiService } from "./ai.service.js";
import { AiChatSchema, ListConversationsSchema } from "./ai.validation.js";

const aiController = new AiController(aiService);

const router = Router();

router.use(authenticate);

router.post("/chat", validate(AiChatSchema), aiController.chat);
router.get("/conversations", validate(ListConversationsSchema), aiController.listConversations);

export default router;
