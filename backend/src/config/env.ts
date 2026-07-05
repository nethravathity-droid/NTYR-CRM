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
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  })
  .superRefine((data, ctx) => {
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
