import type { NextFunction, Request, Response } from "express";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";
import { AppError } from "../errors/AppError.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, {
        statusCode: err.statusCode,
        stack: err.stack,
      });
    } else {
      logger.warn(err.message, { statusCode: err.statusCode });
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error("Unhandled error", { error: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
