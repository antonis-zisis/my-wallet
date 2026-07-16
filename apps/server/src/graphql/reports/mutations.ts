import { GraphQLError } from 'graphql';

import prisma from '../../lib/prisma';
import { parseInput } from '../../lib/validate';
import {
  ReportInput,
  ShareReportInput,
  UpdateReportShareRoleInput,
} from './inputSchemas';
import { resolveReportAccess } from './lib/reportAccess';

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
  shareReport: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const { reportId } = input as { reportId: string };
    const access = await resolveReportAccess(reportId, userId);

    if (!access) {
      throw new GraphQLError('Report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (access.role !== 'OWNER') {
      throw new GraphQLError('Only the report owner can manage sharing', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const data = parseInput(ShareReportInput, input);
    const targetUser = await prisma.user.findFirst({
      where: { email: { equals: data.email, mode: 'insensitive' } },
    });

    if (!targetUser) {
      throw new GraphQLError(
        'No user found with that email — ask them to sign up first',
        { extensions: { code: 'BAD_USER_INPUT' } }
      );
    }

    if (targetUser.supabaseId === userId) {
      throw new GraphQLError('You cannot share a report with yourself', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const alreadyShared = access.report.shares.some(
      (share) => share.userId === targetUser.supabaseId
    );

    if (alreadyShared) {
      throw new GraphQLError('This report is already shared with that user', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    await prisma.reportShare.create({
      data: { reportId, userId: targetUser.supabaseId, role: data.role },
    });

    return prisma.report.findFirst({ where: { id: reportId } });
  },
  updateReportShareRole: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const { id } = input as { id: string };
    const share = await prisma.reportShare.findFirst({
      where: { id },
      include: { report: true },
    });

    if (!share || share.report.userId !== userId) {
      throw new GraphQLError('Share not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const data = parseInput(UpdateReportShareRoleInput, input);

    await prisma.reportShare.update({
      where: { id },
      data: { role: data.role },
    });

    return prisma.report.findFirst({ where: { id: share.reportId } });
  },
  unshareReport: async (
    _parent: unknown,
    { id }: { id: string },
    { userId }: { userId: string }
  ) => {
    const share = await prisma.reportShare.findFirst({
      where: { id },
      include: { report: true },
    });

    if (!share || share.report.userId !== userId) {
      throw new GraphQLError('Share not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    await prisma.reportShare.delete({ where: { id } });

    return prisma.report.findFirst({ where: { id: share.reportId } });
  },
  leaveSharedReport: async (
    _parent: unknown,
    { reportId }: { reportId: string },
    { userId }: { userId: string }
  ) => {
    const share = await prisma.reportShare.findFirst({
      where: { reportId, userId },
    });

    if (!share) {
      throw new GraphQLError('Shared report not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    await prisma.reportShare.delete({ where: { id: share.id } });

    return true;
  },
};
