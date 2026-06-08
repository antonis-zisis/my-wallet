import { subscriptionFieldResolvers } from './fields';
import { subscriptionMutationResolvers } from './mutations';
import { subscriptionQueryResolvers } from './queries';

export type {
  CreateSubscriptionInput,
  ResumeSubscriptionInput,
  UpdateSubscriptionInput,
} from './mutations';

export const subscriptionResolvers = {
  Subscription: subscriptionFieldResolvers,
  Query: subscriptionQueryResolvers,
  Mutation: subscriptionMutationResolvers,
};
