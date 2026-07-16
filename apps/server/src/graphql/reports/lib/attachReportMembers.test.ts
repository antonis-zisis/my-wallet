import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeReportShare } from '../../../test/fixtures/reports';
import { makeUser } from '../../../test/fixtures/users';
import { attachReportMembers } from './attachReportMembers';

vi.mock('../../../lib/prisma', () => ({
  default: {
    reportShare: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('attachReportMembers', () => {
  it('returns an empty array for no reports without querying the DB', async () => {
    const result = await attachReportMembers([]);

    expect(result).toEqual([]);
    expect(prisma.reportShare.findMany).not.toHaveBeenCalled();
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('attaches owner and share members to each report', async () => {
    const report = makeReport();
    const partner = makeUser({
      supabaseId: 'user-2',
      email: 'partner@example.com',
    });
    const share = makeReportShare({ userId: 'user-2' });
    vi.mocked(prisma.reportShare.findMany).mockResolvedValue([
      { ...share, user: partner },
    ] as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()]);

    const result = await attachReportMembers([report]);

    expect(prisma.reportShare.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reportId: { in: [report.id] } },
        include: { user: true },
      })
    );
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { supabaseId: { in: [report.userId] } },
      })
    );
    expect(result).toEqual([
      {
        ...report,
        members: [
          expect.objectContaining({ userId: report.userId, role: 'OWNER' }),
          expect.objectContaining({ userId: 'user-2', role: 'EDITOR' }),
        ],
      },
    ]);
  });
});
