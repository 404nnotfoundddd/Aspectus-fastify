import { GraphQLObjectType } from 'graphql';
import { signUp } from './fields';

export const rootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'The root of all mutations',
    fields: {
        signUp
    }
})
