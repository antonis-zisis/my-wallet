import { reportFields } from './fields';
import { reportMutations } from './mutations';
import { reportQueries } from './queries';

export const reportResolvers = {
  Report: reportFields,
  Query: reportQueries,
  Mutation: reportMutations,
};
