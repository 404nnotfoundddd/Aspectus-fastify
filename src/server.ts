import Fastify from 'fastify';
import { env } from './env';
import { router } from './router';
import * as cors from '@fastify/cors';

export const fastify = Fastify({
    maxParamLength: 5000,
    logger: true,
})


fastify.register(cors, (instance: any) => {
    return (req: any, callback: any) => {
        const corsOptions = {
            origin: env.CORS_ORIGIN,
        };

        callback(null, corsOptions)
    }
})

router();

(async () => {
    try {
        await fastify.listen({ port: parseInt(env.PORT), host: env.HOST });
        console.log(`Server listening on http://localhost:${env.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})()


