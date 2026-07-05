import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const authorize =
  (...requiredPermissions: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user?.companyId) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (requiredPermissions.length === 0) {
      next();
      return;
    }

    const hasPermission = requiredPermissions.some((permission) =>
      req.user!.permissions.includes(permission),
    );

    if (!hasPermission) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }

    next();
  };

export const authorizeRoles =
  (...allowedRoles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user?.companyId) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      next(new AppError(403, "Insufficient role privileges"));
      return;
    }

    next();
  };
