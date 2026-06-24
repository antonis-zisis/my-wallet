import { contractResolvers } from './contracts/resolvers';
import { contractTypeDefs } from './contracts/schema';
import { healthResolvers } from './health/resolvers';
import { healthTypeDefs } from './health/schema';
import { netWorthResolvers } from './netWorth/resolvers';
import { netWorthTypeDefs } from './netWorth/schema';
import { reportResolvers } from './reports/resolvers';
import { reportTypeDefs } from './reports/schema';
import { subscriptionResolvers } from './subscriptions/resolvers';
import { subscriptionTypeDefs } from './subscriptions/schema';
import { transactionResolvers } from './transactions/resolvers';
import { transactionTypeDefs } from './transactions/schema';
import { userResolvers } from './user/resolvers';
import { userTypeDefs } from './user/schema';

export const typeDefs = [
  healthTypeDefs,
  transactionTypeDefs,
  reportTypeDefs,
  netWorthTypeDefs,
  subscriptionTypeDefs,
  contractTypeDefs,
  userTypeDefs,
];

export const resolvers = {
  Report: {
    ...reportResolvers.Report,
  },
  NetWorthSnapshot: {
    ...netWorthResolvers.NetWorthSnapshot,
  },
  Subscription: {
    ...subscriptionResolvers.Subscription,
  },
  Contract: {
    ...contractResolvers.Contract,
  },
  Query: {
    ...healthResolvers.Query,
    ...transactionResolvers.Query,
    ...reportResolvers.Query,
    ...netWorthResolvers.Query,
    ...subscriptionResolvers.Query,
    ...contractResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...transactionResolvers.Mutation,
    ...reportResolvers.Mutation,
    ...netWorthResolvers.Mutation,
    ...subscriptionResolvers.Mutation,
    ...contractResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
