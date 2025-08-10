import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  JWT_TOKEN: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FREESTYLE_API_URL: z.string().default("https://api.freestyle.sh"),
  FIRECRAWL_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
