import { env } from '@/env'
import Redis from 'ioredis'

export const keydb = new Redis(env.KEYDB_URL)