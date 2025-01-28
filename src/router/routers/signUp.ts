import { init, createId } from '@paralleldrive/cuid2'
import { fastify } from '../../server'
import { keydb } from '@/keydb'
import { rateLimitByIP } from '@/helpers'
import { hToS } from '@/utils'
import bcrypt from 'bcryptjs'

const createSecretCuid = init({
    length: 30,
})

const createUniqueUserID = async () => {
    let generating = true
    let count = 0
    const MAX_COUNT = 10

    let secretID = createId()

    while (generating) {
        if (count > MAX_COUNT) break

        const res = await keydb.sadd('users:IDs:all', secretID)
        count++
        if (res === 1) generating = false
    }

    return secretID
}

export const signUp = () => fastify.post('/sign-up', (async (req, rep) => {
    await rateLimitByIP(req, 'sign-in', 10, hToS(24))

    const userID = await createUniqueUserID()
    const secretID = (() => {
        let ID = createSecretCuid()

        for (let i = 0; i < 3; i++) {
            ID = ID + createSecretCuid()
        }

        return ID
    })()

    const salt = bcrypt.genSaltSync(10);
    const secretIDHash = bcrypt.hashSync(secretID, salt).toString()

    await keydb.set(`secret_ID:${secretIDHash}:user_ID`, userID)
    await keydb.set(`user:${userID}:secret_ID`, secretIDHash)
    await keydb.sadd('users:IDs:all', userID)

    rep.send({
        secretID,
        userID,
    })
}))


