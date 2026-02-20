import { netWorthResolvers } from './netWorth/resolvers';
import { netWorthTypeDefs } from './netWorth/schema';
import { reportResolvers } from './reports/resolvers';
import { reportTypeDefs } from './reports/schema';
import { baseResolvers } from './resolvers';
import { baseTypeDefs } from './schema';
import { transactionResolvers } from './transactions/resolvers';
import { transactionTypeDefs } from './transactions/schema';

export const typeDefs = [
  baseTypeDefs,
  transactionTypeDefs,
  reportTypeDefs,
  netWorthTypeDefs,
];

export const resolvers = {
  Report: {
    ...reportResolvers.Report,
  },
  NetWorthSnapshot: {
    ...netWorthResolvers.NetWorthSnapshot,
  },
  Query: {
    ...baseResolvers.Query,
    ...transactionResolvers.Query,
    ...reportResolvers.Query,
    ...netWorthResolvers.Query,
  },
  Mutation: {
    ...transactionResolvers.Mutation,
    ...reportResolvers.Mutation,
    ...netWorthResolvers.Mutation,
  },
};
