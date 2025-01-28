import { keydb } from '@/keydb'
import { fastify } from '../../server'
import { z } from 'zod'
import { rateLimitByIP } from '../../helpers'
import { hToS } from '../../utils/hToS'
import { compareSync } from 'bcryptjs'
import { ServerError } from '@/utils'

export const signIn = () => fastify.post('/sign-in', (async (req, rep) => {
    await rateLimitByIP(req, 'sign-in', 10, hToS(1))

    const { secretID, userID } = z.object({
        userID: z.string(),
        secretID: z.string(),
    }).parse(req.body)

    const hashedSecretID = await keydb.get(`user:${userID}:secret_ID`)
    if (!hashedSecretID) throw new ServerError({
        code: 'UNAUTHORIZED',
    })

    const isValidSecret = compareSync(secretID, hashedSecretID)
    if (!isValidSecret) throw new ServerError({
        code: 'UNAUTHORIZED',
    })


    return rep.send('success')
}))