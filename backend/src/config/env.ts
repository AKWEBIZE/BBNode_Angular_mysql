import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Fail fast at boot rather than at the first request that needs a missing value.
const schema = z.object({
  PORT: z.coerce.number().default(8081),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Spring served everything under server.servlet.context-path, and the Angular
  // app has that prefix baked into its apiUrl values, so it is reproduced here.
  BASE_PATH: z.string().default('/bigbisort-imp-exp'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // No default: the Java version shipped a hard-coded secret, which must not be repeated.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('30m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),

  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  // Where enquiry summaries go; unset means only the visitor is acknowledged.
  MAIL_ENQUIRY_RECIPIENT: z.string().optional(),
  // Hosted logo for the email header, replacing the inlined base64 image.
  MAIL_LOGO_URL: z.string().optional(),

  CORS_ORIGINS: z.string().default('http://localhost:4200'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
