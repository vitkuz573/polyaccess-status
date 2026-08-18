import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1).default(process.env.DATABASE_URL ?? ""),
  REDIS_URL: z.string().default("redis://localhost:6382"),
  KEY_SERVICE_URL: z.string().url().default("http://localhost:8082"),
  ADMIN_API_KEY: z.string().min(1).default(process.env.ADMIN_API_KEY ?? ""),
  PORTAL_BASE_URL: z.string().url().default("http://localhost:3000"),
  CHALLENGE_PROXY_URL: z.string().url().default("http://localhost:8081"),
  APP_BASE_URL: z.string().url().default("http://localhost:3001"),
  SECURE_COOKIES: z.enum(["true", "false"]).default("false"),
  ACCESS_TOKEN_SECRET: z.string().min(32).default("change-me-in-production-access-token-secret-min-32-chars"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issueList = (parsed.error as { issues?: Array<{ path: (string | number)[]; message: string }> }).issues;
  const errors = (issueList ?? [])
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables: ${errors}`);
}

export const env = parsed.data;
