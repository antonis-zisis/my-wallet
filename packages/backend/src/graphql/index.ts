import { reportResolvers } from './reports/resolvers';
import { reportTypeDefs } from './reports/schema';
import { baseResolvers } from './resolvers';
import { baseTypeDefs } from './schema';
import { transactionResolvers } from './transactions/resolvers';
import { transactionTypeDefs } from './transactions/schema';

export const typeDefs = [baseTypeDefs, transactionTypeDefs, reportTypeDefs];

export const resolvers = {
  Query: {
    ...baseResolvers.Query,
    ...transactionResolvers.Query,
    ...reportResolvers.Query,
  },
  Mutation: {
    ...transactionResolvers.Mutation,
    ...reportResolvers.Mutation,
  },
};
