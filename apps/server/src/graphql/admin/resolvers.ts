import { adminUserFieldResolvers } from './fields';
import { adminMutationResolvers } from './mutations';
import { adminQueryResolvers } from './queries';

export const adminResolvers = {
  AdminUser: adminUserFieldResolvers,
  Query: adminQueryResolvers,
  Mutation: adminMutationResolvers,
};
