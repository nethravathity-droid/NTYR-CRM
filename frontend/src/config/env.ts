import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1).default("All-in-One CRM"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid frontend environment configuration");
}

export const env = parsed.data;
