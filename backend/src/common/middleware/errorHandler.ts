import type { NextFunction, Request, Response } from "express";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";
import { AppError } from "../errors/AppError.js";

const getDatabaseErrorMessage = (err: Error): string | null => {
  const pgError = err as Error & { code?: string; constraint?: string };

  switch (pgError.code) {
    case "23505":
      if (
        pgError.constraint === "uq_company_code" ||
        err.message.includes("uq_company_code")
      ) {
        return "Company code already exists. Open that company from the list or choose a different code.";
      }
      if (
        pgError.constraint === "uq_company_email" ||
        err.message.includes("uq_company_email")
      ) {
        return "Company email already exists. Use a different email or open the existing company.";
      }
      return "A record with this value already exists.";
    case "28P01":
      return "Database authentication failed. Check DB_USER and DB_PASSWORD in backend/.env";
    case "3D000":
      return 'Database does not exist. Create it with: CREATE DATABASE real_estate_crm;';
    case "42P01":
      return "Database tables are missing. Run schema migrations in database/schema/ then npm run seed";
    case "ECONNREFUSED":
      return "Cannot connect to PostgreSQL. Ensure PostgreSQL is running on localhost:5432";
    default:
      return null;
  }
};

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

  const databaseMessage = getDatabaseErrorMessage(err);

  logger.error("Unhandled error", { error: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : (databaseMessage ?? err.message),
  });
};
