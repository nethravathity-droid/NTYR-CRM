import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url().optional(),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string(),
    CORS_ORIGIN: z.string().default("*"),
    RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(500),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
    ACCOUNT_LOCK_DURATION_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .default(30),
  })
  .superRefine((data, ctx) => {
    if (data.DB_USER.toLowerCase() === "postgre") {
      ctx.addIssue({
        code: "custom",
        path: ["DB_USER"],
        message:
          'DB_USER is "postgre" — did you mean "postgres"? Check backend/.env and any system environment variables.',
      });
    }

    if (
      !data.DATABASE_URL &&
      (data.DB_PASSWORD === "YOUR_POSTGRES_PASSWORD" ||
        data.DB_PASSWORD === "your_password")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["DB_PASSWORD"],
        message:
          "DB_PASSWORD is still a placeholder. Set your real PostgreSQL password in backend/.env",
      });
    }

    if (!data.DATABASE_URL) {
      if (!data.DB_NAME) {
        ctx.addIssue({
          code: "custom",
          path: ["DB_NAME"],
          message: "DB_NAME is required when DATABASE_URL is not set",
        });
      }
      if (!data.DB_USER) {
        ctx.addIssue({
          code: "custom",
          path: ["DB_USER"],
          message: "DB_USER is required when DATABASE_URL is not set",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
