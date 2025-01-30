import { GraphQLSchema } from 'graphql';
import { rootQueryType } from './rootQueryType';
import { rootMutationType } from './rootMutationType';

export const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
})