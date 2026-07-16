import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { parseInput } from '../../lib/validate';
import { ReportInput } from './inputSchemas';

export const reportMutations = {
  createReport: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const data = parseInput(ReportInput, input);

    return prisma.report.create({ data: { title: data.title, userId } });
  },
  updateReport: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const { id } = input as { id: string };
    const existing = await prisma.report.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new GraphQLError('Report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (existing.isLocked) {
      throw new GraphQLError('Report is locked', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const data = parseInput(ReportInput, input);

    return prisma.report.update({
      where: { id },
      data: { title: data.title },
    });
  },
  deleteReport: async (
    _parent: unknown,
    { id }: { id: string },
    { userId }: { userId: string }
  ) => {
    const existing = await prisma.report.findFirst({ where: { id, userId } });

    if (!existing) {
      throw new GraphQLError('Report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (existing.isLocked) {
      throw new GraphQLError('Report is locked', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await prisma.report.delete({ where: { id } });

    return true;
  },
  lockReport: async (
    _parent: unknown,
    { id }: { id: string },
    { userId }: { userId: string }
  ) => {
    const existing = await prisma.report.findFirst({ where: { id, userId } });

    if (!existing) {
      throw new GraphQLError('Report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return prisma.report.update({ where: { id }, data: { isLocked: true } });
  },
  unlockReport: async (
    _parent: unknown,
    { id }: { id: string },
    { userId }: { userId: string }
  ) => {
    const existing = await prisma.report.findFirst({ where: { id, userId } });

    if (!existing) {
      throw new GraphQLError('Report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return prisma.report.update({ where: { id }, data: { isLocked: false } });
  },
};
