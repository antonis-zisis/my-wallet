import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { parseInput } from '../../lib/validate';
import { CreateContractInput, UpdateContractInput } from './inputSchemas';

export const contractMutationResolvers = {
  createContract: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const data = parseInput(CreateContractInput, input);

    return prisma.contract.create({
      data: {
        category: data.category,
        provider: data.provider,
        plan: data.plan ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        cost: data.cost ?? null,
        userId,
      },
    });
  },
  updateContract: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const { id } = input as { id: string };
    const existing = await prisma.contract.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new GraphQLError('Contract not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const data = parseInput(UpdateContractInput, input);

    return prisma.contract.update({
      where: { id },
      data: {
        category: data.category,
        provider: data.provider,
        plan: data.plan ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        cost: data.cost ?? null,
      },
    });
  },
  deleteContract: async (
    _parent: unknown,
    { id }: { id: string },
    { userId }: { userId: string }
  ) => {
    const existing = await prisma.contract.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new GraphQLError('Contract not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    await prisma.contract.delete({ where: { id } });

    return true;
  },
};
