import { contractFieldResolvers } from './fields';
import { contractMutationResolvers } from './mutations';
import { contractQueryResolvers } from './queries';

export const contractResolvers = {
  Contract: contractFieldResolvers,
  Query: contractQueryResolvers,
  Mutation: contractMutationResolvers,
};
