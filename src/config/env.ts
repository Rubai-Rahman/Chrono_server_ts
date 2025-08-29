
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = z.object({
    NODE_ENV: z.enum(['production', 'development', 'test']),
    PORT: z.coerce.number().default(3000),
    MONGO_URI: z.string(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    CORS_ORIGIN: z.string().default('*'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  });

const envVars = envVarsSchema.parse(process.env);

export const config = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGO_URI: envVars.MONGO_URI,
  LOG_LEVEL: envVars.LOG_LEVEL,
  CORS_ORIGIN: envVars.CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: envVars.RATE_LIMIT_MAX_REQUESTS,
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
};


