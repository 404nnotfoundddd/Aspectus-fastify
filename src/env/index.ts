import { z } from 'zod'

const schemaObject = {
  PORT: z.string(),
  HOST: z.string().optional(),
  KEYDB_URL: z.string(),
  CORS_ORIGIN: z.string(),
  NODE_ENV: z.enum(['development', 'production']),
}

const envSchema = z.object(schemaObject)
export const env = envSchema.parse(process.env)
