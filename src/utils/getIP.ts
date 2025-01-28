import type { RawRequestDefaultExpression } from 'fastify';
import type { FastifyRequestType } from 'fastify/types/type-provider';

export const getIP = (headers: RawRequestDefaultExpression['headers'] & FastifyRequestType['headers']) => {
    const FALLBACK_IP_ADDRESS = '0.0.0.0'
    const cloudflareIP = headers['cf-connecting-ip'] as string | undefined

    if (cloudflareIP) return cloudflareIP ?? FALLBACK_IP_ADDRESS
    console.log('headers', headers)

    return headers['x-forwarded-for'] as string | undefined ?? FALLBACK_IP_ADDRESS
}