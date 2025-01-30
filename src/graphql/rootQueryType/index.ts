import { GraphQLObjectType } from 'graphql'
import { signIn } from './fields'

export const rootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'The root of all queries',
    fields: {
        signIn
    }
})
