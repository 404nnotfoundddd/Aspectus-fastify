import { env } from '@/env'
import { keydb } from '@/keydb'
import { getIP, ServerError } from '@/utils'
import type { FastifyRequest } from 'fastify'

export const rateLimitByIP = async (req: FastifyRequest, name: string, max: number, expiryInSeconds: number) => {
    if (env.NODE_ENV === 'development') return

    const IP = getIP(req.headers)
    const retryCount = await keydb.incr(`rate_limit:IP:${IP}:name:${name}`)

    await keydb.expire(`rate_limit:${name}`, expiryInSeconds)

    if (retryCount > max) {
        throw new ServerError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests from your IP. Please try again later.',
        })
    }
}
