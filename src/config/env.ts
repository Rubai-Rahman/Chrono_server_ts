import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Define schema for environment variables
const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  BCRYPT_SALT_ROUNDS: z.coerce.number().optional(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES: z.string(),
  REMEMBER_ME_REFRESH_EXPIRES: z.string().default('30d'),
});

// Parse and validate environment variables
const envVars = envVarsSchema.parse(process.env);

// Export config object
export const config = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGO_URI: envVars.MONGO_URI,
  LOG_LEVEL: envVars.LOG_LEVEL,
  CORS_ORIGIN: envVars.CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: envVars.RATE_LIMIT_MAX_REQUESTS,
  bcrypt_salt_rounds: envVars.BCRYPT_SALT_ROUNDS ?? 10, // default 10
  ACCESS_TOKEN_SECRET: envVars.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES: envVars.ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET: envVars.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES: envVars.REFRESH_TOKEN_EXPIRES,
  REMEMBER_ME_REFRESH_EXPIRES: envVars.REMEMBER_ME_REFRESH_EXPIRES,
};
