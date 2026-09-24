import { Prisma } from '../../../generated/prisma/client';

export const transactionOrderBy: Array<Prisma.TransactionOrderByWithRelationInput> =
  [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }];
