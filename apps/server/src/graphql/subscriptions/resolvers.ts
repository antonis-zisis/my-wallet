import { subscriptionFieldResolvers } from './fields';
import { subscriptionMutationResolvers } from './mutations';
import { subscriptionQueryResolvers } from './queries';

export const subscriptionResolvers = {
  Subscription: subscriptionFieldResolvers,
  Query: subscriptionQueryResolvers,
  Mutation: subscriptionMutationResolvers,
};
