import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport } from '../../test/fixtures/reports';
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
});
