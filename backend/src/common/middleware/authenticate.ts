import type { NextFunction, Request, Response } from "express";
import { authService } from "../../modules/auth/auth.service.js";
import { AppError } from "../errors/AppError.js";

const extractBearerToken = (req: Request): string => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "Access token required");
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    throw new AppError(401, "Access token required");
  }

  return token;
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractBearerToken(req);
    const payload = authService.verifyAccessToken(token);
    req.user = authService.mapAccessPayloadToUser(payload);

    if (!req.user.companyId) {
      throw new AppError(401, "Invalid token: company context missing");
    }

    next();
  } catch (error) {
    next(error);
  }
};
