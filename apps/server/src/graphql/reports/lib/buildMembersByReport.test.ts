import { describe, expect, it } from 'vitest';

import { makeReport, makeReportShare } from '../../../test/fixtures/reports';
import { makeUser } from '../../../test/fixtures/users';
import { buildMembersByReport } from './buildMembersByReport';

describe('buildMembersByReport', () => {
  it('lists the owner first, then share members', () => {
    const report = makeReport();
    const owner = makeUser();
    const partner = makeUser({
      id: 'user-row-2',
      supabaseId: 'user-2',
      email: 'partner@example.com',
      fullName: 'Partner Person',
    });
    const share = makeReportShare({ userId: 'user-2', role: 'VIEWER' });

    const membersByReport = buildMembersByReport(
      [report],
      [{ ...share, user: partner }],
      [owner]
    );

    expect(membersByReport.get(report.id)).toEqual([
      {
        id: report.userId,
        userId: report.userId,
        email: owner.email,
        fullName: owner.fullName,
        role: 'OWNER',
      },
      {
        id: share.id,
        userId: 'user-2',
        email: 'partner@example.com',
        fullName: 'Partner Person',
        role: 'VIEWER',
      },
    ]);
  });

  it('omits the owner entry when the owner user row is missing', () => {
    const report = makeReport();
    const partner = makeUser({ supabaseId: 'user-2' });
    const share = makeReportShare({ userId: 'user-2' });

    const membersByReport = buildMembersByReport(
      [report],
      [{ ...share, user: partner }],
      []
    );

    expect(membersByReport.get(report.id)).toEqual([
      expect.objectContaining({ userId: 'user-2', role: 'EDITOR' }),
    ]);
  });

  it('ignores shares that belong to a report outside the given list', () => {
    const report = makeReport();
    const strayShare = makeReportShare({
      reportId: 'other-report',
      userId: 'user-2',
    });

    const membersByReport = buildMembersByReport(
      [report],
      [{ ...strayShare, user: makeUser({ supabaseId: 'user-2' }) }],
      [makeUser()]
    );

    expect(membersByReport.get(report.id)).toHaveLength(1);
    expect(membersByReport.has('other-report')).toBe(false);
  });
});
