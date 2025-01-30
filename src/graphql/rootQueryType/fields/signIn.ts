import { GraphQLBoolean, GraphQLObjectType, GraphQLString, type GraphQLFieldConfig } from 'graphql';
import { keydb } from '@/keydb'
import { compareSync } from 'bcryptjs'
import { ServerError } from '@/utils'


export const signIn: GraphQLFieldConfig<any, any> = {
    description: 'Sign in endpoint',
    type: new GraphQLObjectType({
        name: 'signInResponse',
        fields: {
            success: { type: GraphQLBoolean }
        }
    }),
    args: {
        secretID: { type: GraphQLString },
        userID: { type: GraphQLString }
    },
    resolve: async (_, args: { secretID: string, userID: string }) => {
        const { secretID, userID } = args

        const hashedSecretID = await keydb.get(`user:${userID}:secret_ID`)
        if (!hashedSecretID) throw new ServerError({
            code: 'UNAUTHORIZED',
        })

        const isValidSecret = compareSync(secretID, hashedSecretID)
        if (!isValidSecret) throw new ServerError({
            code: 'UNAUTHORIZED',
        })


        return { success: true }
    }
} as const 