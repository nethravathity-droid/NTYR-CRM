import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/AppError.js";

export const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      next(new AppError(400, messages.join("; ")));
      return;
    }

    Object.assign(req, { validated: result.data });
    next();
  };

declare global {
  namespace Express {
    interface Request {
      validated?: unknown;
    }
  }
}
