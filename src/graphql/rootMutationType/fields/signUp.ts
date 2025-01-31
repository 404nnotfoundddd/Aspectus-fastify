import { init, createId } from '@paralleldrive/cuid2'
import { keydb } from '@/keydb'
import bcrypt from 'bcryptjs'
import { GraphQLObjectType, GraphQLString, type GraphQLFieldConfig } from 'graphql'

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


const signUpPayload = new GraphQLObjectType({
    name: 'signUpResponse',
    fields: {
        secretID: { type: GraphQLString },
        userID: { type: GraphQLString },
    }
})

export const signUp: GraphQLFieldConfig<any, any> = {
    description: 'User sign up endpoint',
    type: signUpPayload,
    resolve: async (): Promise<{
        secretID: string,
        userID: string,
    }> => {
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

        return {
            secretID,
            userID,
        }
    }
} as const 