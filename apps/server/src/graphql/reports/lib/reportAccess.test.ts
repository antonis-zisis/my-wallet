import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeReport, makeReportShare } from '../../../test/fixtures/reports';
import { reportAccessWhere, resolveReportAccess } from './reportAccess';

vi.mock('../../../lib/prisma', () => ({
  default: {
    report: {
      findFirst: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('reportAccessWhere', () => {
  it('matches reports the user owns or has a share on', () => {
    expect(reportAccessWhere('user-1')).toEqual({
      OR: [{ userId: 'user-1' }, { shares: { some: { userId: 'user-1' } } }],
    });
  });
});

describe('resolveReportAccess', () => {
  it('returns null when the report does not exist', async () => {
    vi.mocked(prisma.report.findFirst).mockResolvedValue(null);

    const access = await resolveReportAccess('missing', 'user-1');

    expect(access).toBeNull();
  });

  it('returns OWNER for the report creator', async () => {
    const report = { ...makeReport({ userId: 'user-1' }), shares: [] };
    vi.mocked(prisma.report.findFirst).mockResolvedValue(report);

    const access = await resolveReportAccess(report.id, 'user-1');

    expect(access).toEqual({ report, role: 'OWNER' });
  });

  it('returns the share role for a shared user', async () => {
    const report = {
      ...makeReport({ userId: 'user-1' }),
      shares: [makeReportShare({ userId: 'user-2', role: 'VIEWER' })],
    };
    vi.mocked(prisma.report.findFirst).mockResolvedValue(report);

    const access = await resolveReportAccess(report.id, 'user-2');

    expect(access).toEqual({ report, role: 'VIEWER' });
  });

  it('returns null for a user with no ownership or share', async () => {
    const report = {
      ...makeReport({ userId: 'user-1' }),
      shares: [makeReportShare({ userId: 'user-2' })],
    };
    vi.mocked(prisma.report.findFirst).mockResolvedValue(report);

    const access = await resolveReportAccess(report.id, 'user-3');

    expect(access).toBeNull();
  });
});
