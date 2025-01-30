import Fastify from 'fastify'
import { env } from './env'
import * as cors from '@fastify/cors'
import { keydb } from '@/keydb'
import fastifyRateLimit from '@fastify/rate-limit'
import mercurius from 'mercurius'
import { schema } from './graphql/schema'
import { getIP } from './utils'

export const fastify = Fastify({
    maxParamLength: 5000,
    logger: true,
})

await fastify.register(fastifyRateLimit, {
    global: true,
    timeWindow: 5000,
    redis: keydb,
    keyGenerator: (request) => {
        return getIP(request.headers)
    }
})


fastify.register(cors, (instance: any) => {
    return (req: any, callback: any) => {
        const corsOptions = {
            origin: env.CORS_ORIGIN,
        };

        callback(null, corsOptions)
    }
});


fastify.register(mercurius, {
    schema,
    graphiql: true,
});


(async () => {
    try {
        await fastify.listen({ port: parseInt(env.PORT), host: env.HOST })
        console.log(`Server listening on http://localhost:${env.PORT}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()


