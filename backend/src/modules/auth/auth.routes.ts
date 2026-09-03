import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/utils/validate.js";
import { AuthController } from "./auth.controller.js";
import { authService } from "./auth.service.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const authController = new AuthController(authService);

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/register", validate(registerSchema), authController.register);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
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
