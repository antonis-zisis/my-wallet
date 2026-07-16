import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeReportShare } from '../../test/fixtures/reports';
import { makeUser } from '../../test/fixtures/users';
import { reportMutations } from './mutations';

const USER_ID = 'user-1';
const CTX = { userId: USER_ID };

vi.mock('../../lib/prisma', () => ({
  default: {
    report: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reportShare: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('reportMutations', () => {
  describe('createReport', () => {
    it('creates a report with the given title', async () => {
      const report = makeReport();
      vi.mocked(prisma.report.create).mockResolvedValue(report);

      const result = await reportMutations.createReport(
        undefined as unknown,
        { input: { title: 'January Budget' } },
        CTX
      );

      expect(prisma.report.create).toHaveBeenCalledWith({
        data: { title: 'January Budget', userId: USER_ID },
      });
      expect(result).toEqual(report);
    });

    it('throws BAD_USER_INPUT when title exceeds 255 characters', async () => {
      await expect(
        reportMutations.createReport(
          undefined as unknown,
          { input: { title: 'x'.repeat(256) } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.create).not.toHaveBeenCalled();
    });
  });

  describe('updateReport', () => {
    it('updates a report title', async () => {
      const existing = makeReport();
      const updated = makeReport({
        title: 'February Budget',
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      });
      vi.mocked(prisma.report.findFirst).mockResolvedValue(existing);
      vi.mocked(prisma.report.update).mockResolvedValue(updated);

      const result = await reportMutations.updateReport(
        undefined as unknown,
        { input: { id: 'report-1', title: 'February Budget' } },
        CTX
      );

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { id: 'report-1', userId: USER_ID },
      });
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { title: 'February Budget' },
      });
      expect(result).toEqual(updated);
    });

    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.updateReport(
          undefined as unknown,
          { input: { id: 'report-1', title: 'February Budget' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN when the report is locked', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        makeReport({ isLocked: true })
      );

      await expect(
        reportMutations.updateReport(
          undefined as unknown,
          { input: { id: 'report-1', title: 'February Budget' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteReport', () => {
    it('deletes a report and returns true', async () => {
      const report = makeReport();
      vi.mocked(prisma.report.findFirst).mockResolvedValue(report);
      vi.mocked(prisma.report.delete).mockResolvedValue(report);

      const result = await reportMutations.deleteReport(
        undefined as unknown,
        { id: 'report-1' },
        CTX
      );

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { id: 'report-1', userId: USER_ID },
      });
      expect(prisma.report.delete).toHaveBeenCalledWith({
        where: { id: 'report-1' },
      });
      expect(result).toBe(true);
    });

    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.deleteReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.delete).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN when the report is locked', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(
        makeReport({ isLocked: true })
      );

      await expect(
        reportMutations.deleteReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.delete).not.toHaveBeenCalled();
    });
  });

  describe('lockReport', () => {
    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.lockReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });
  });

  describe('unlockReport', () => {
    it('throws NOT_FOUND when the report does not exist or belongs to another user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.unlockReport(
          undefined as unknown,
          { id: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.report.update).not.toHaveBeenCalled();
    });
  });

  describe('shareReport', () => {
    const shareInput = {
      reportId: 'report-1',
      email: 'Partner@Example.com',
      role: 'EDITOR',
    };

    it('creates a share for a registered user', async () => {
      const report = makeReport();
      const partner = makeUser({
        supabaseId: 'user-2',
        email: 'partner@example.com',
      });
      vi.mocked(prisma.report.findFirst)
        .mockResolvedValueOnce({ ...report, shares: [] } as never)
        .mockResolvedValueOnce(report);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(partner);

      const result = await reportMutations.shareReport(
        undefined as unknown,
        { input: shareInput },
        CTX
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: { equals: 'partner@example.com', mode: 'insensitive' },
        },
      });
      expect(prisma.reportShare.create).toHaveBeenCalledWith({
        data: { reportId: 'report-1', userId: 'user-2', role: 'EDITOR' },
      });
      expect(result).toEqual(report);
    });

    it('throws NOT_FOUND when the report does not exist or the caller has no access', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.shareReport(
          undefined as unknown,
          { input: shareInput },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.create).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN when the caller is a member but not the owner', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport({ userId: 'other-owner' }),
        shares: [makeReportShare({ userId: USER_ID, role: 'EDITOR' })],
      } as never);

      await expect(
        reportMutations.shareReport(
          undefined as unknown,
          { input: shareInput },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.create).not.toHaveBeenCalled();
    });

    it('throws BAD_USER_INPUT when no user has that email', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport(),
        shares: [],
      } as never);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.shareReport(
          undefined as unknown,
          { input: shareInput },
          CTX
        )
      ).rejects.toThrow('No user found with that email');
      expect(prisma.reportShare.create).not.toHaveBeenCalled();
    });

    it('throws BAD_USER_INPUT when sharing with yourself', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport(),
        shares: [],
      } as never);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(
        makeUser({ supabaseId: USER_ID })
      );

      await expect(
        reportMutations.shareReport(
          undefined as unknown,
          { input: shareInput },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.create).not.toHaveBeenCalled();
    });

    it('throws BAD_USER_INPUT when the report is already shared with that user', async () => {
      vi.mocked(prisma.report.findFirst).mockResolvedValue({
        ...makeReport(),
        shares: [makeReportShare({ userId: 'user-2' })],
      } as never);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(
        makeUser({ supabaseId: 'user-2' })
      );

      await expect(
        reportMutations.shareReport(
          undefined as unknown,
          { input: shareInput },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.create).not.toHaveBeenCalled();
    });
  });

  describe('updateReportShareRole', () => {
    it('updates the role of a share on a report the caller owns', async () => {
      const report = makeReport();
      vi.mocked(prisma.reportShare.findFirst).mockResolvedValue({
        ...makeReportShare(),
        report,
      } as never);
      vi.mocked(prisma.report.findFirst).mockResolvedValue(report);

      const result = await reportMutations.updateReportShareRole(
        undefined as unknown,
        { input: { id: 'share-1', role: 'VIEWER' } },
        CTX
      );

      expect(prisma.reportShare.update).toHaveBeenCalledWith({
        where: { id: 'share-1' },
        data: { role: 'VIEWER' },
      });
      expect(result).toEqual(report);
    });

    it('throws NOT_FOUND when the share belongs to a report the caller does not own', async () => {
      vi.mocked(prisma.reportShare.findFirst).mockResolvedValue({
        ...makeReportShare(),
        report: makeReport({ userId: 'other-owner' }),
      } as never);

      await expect(
        reportMutations.updateReportShareRole(
          undefined as unknown,
          { input: { id: 'share-1', role: 'VIEWER' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.update).not.toHaveBeenCalled();
    });
  });

  describe('unshareReport', () => {
    it('deletes a share on a report the caller owns', async () => {
      const report = makeReport();
      vi.mocked(prisma.reportShare.findFirst).mockResolvedValue({
        ...makeReportShare(),
        report,
      } as never);
      vi.mocked(prisma.report.findFirst).mockResolvedValue(report);

      const result = await reportMutations.unshareReport(
        undefined as unknown,
        { id: 'share-1' },
        CTX
      );

      expect(prisma.reportShare.delete).toHaveBeenCalledWith({
        where: { id: 'share-1' },
      });
      expect(result).toEqual(report);
    });

    it('throws NOT_FOUND when the share belongs to a report the caller does not own', async () => {
      vi.mocked(prisma.reportShare.findFirst).mockResolvedValue({
        ...makeReportShare(),
        report: makeReport({ userId: 'other-owner' }),
      } as never);

      await expect(
        reportMutations.unshareReport(
          undefined as unknown,
          { id: 'share-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.delete).not.toHaveBeenCalled();
    });
  });

  describe('leaveSharedReport', () => {
    it('deletes the caller own share and returns true', async () => {
      vi.mocked(prisma.reportShare.findFirst).mockResolvedValue(
        makeReportShare({ userId: USER_ID })
      );

      const result = await reportMutations.leaveSharedReport(
        undefined as unknown,
        { reportId: 'report-1' },
        CTX
      );

      expect(prisma.reportShare.findFirst).toHaveBeenCalledWith({
        where: { reportId: 'report-1', userId: USER_ID },
      });
      expect(prisma.reportShare.delete).toHaveBeenCalledWith({
        where: { id: 'share-1' },
      });
      expect(result).toBe(true);
    });

    it('throws NOT_FOUND when the caller has no share on the report', async () => {
      vi.mocked(prisma.reportShare.findFirst).mockResolvedValue(null);

      await expect(
        reportMutations.leaveSharedReport(
          undefined as unknown,
          { reportId: 'report-1' },
          CTX
        )
      ).rejects.toThrow(GraphQLError);
      expect(prisma.reportShare.delete).not.toHaveBeenCalled();
    });
  });
});
