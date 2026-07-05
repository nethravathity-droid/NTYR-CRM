import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../utils/validate.js";
import { AuthController } from "./auth.controller.js";
import { authService } from "./auth.service.js";
import {
  changePasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
} from "./auth.validation.js";

const authController = new AuthController(authService);

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", validate(logoutSchema), authController.logout);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.get("/me", authenticate, authController.getMe);

export default router;
