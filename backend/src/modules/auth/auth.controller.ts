import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { AuthService } from "./auth.service.js";
import type {
  changePasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
} from "./auth.validation.js";
import type { z } from "zod";

type LoginRequest = Request & { validated: z.infer<typeof loginSchema> };
type RefreshRequest = Request & {
  validated: z.infer<typeof refreshTokenSchema>;
};
type LogoutRequest = Request & { validated: z.infer<typeof logoutSchema> };
type ChangePasswordRequest = Request & {
  validated: z.infer<typeof changePasswordSchema>;
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as LoginRequest).validated;

    const result = await this.authService.login(body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as RefreshRequest).validated;

    const tokens = await this.authService.refresh(body);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: tokens,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as LogoutRequest).validated;

    await this.authService.logout(body);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });

  changePassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { body } = (req as ChangePasswordRequest).validated;

      if (!req.user?.companyId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      await this.authService.changePassword(
        req.user.id,
        req.user.companyId,
        body,
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully. Please login again.",
      });
    },
  );

  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.companyId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const currentUser = await this.authService.getCurrentUser(
      req.user.id,
      req.user.companyId,
    );

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: currentUser,
    });
  });
}
