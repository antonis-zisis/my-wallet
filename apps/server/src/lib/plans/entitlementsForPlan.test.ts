import { describe, expect, it } from 'vitest';

import { entitlementsForPlan } from './entitlementsForPlan';

describe('entitlementsForPlan', () => {
  it('caps every limit on the Free plan', () => {
    const entitlements = entitlementsForPlan('FREE');

    expect(entitlements).toEqual({
      canExportCsv: false,
      canShareReports: false,
      maxContracts: 3,
      maxNetWorthSnapshots: 1,
      maxReports: 3,
      maxSubscriptions: 3,
      maxTrendMonths: 3,
    });
  });

  it('removes every limit on the Pro plan', () => {
    const entitlements = entitlementsForPlan('PRO');

    expect(entitlements).toEqual({
      canExportCsv: true,
      canShareReports: true,
      maxContracts: null,
      maxNetWorthSnapshots: null,
      maxReports: null,
      maxSubscriptions: null,
      maxTrendMonths: 12,
    });
  });

  it('falls back to Free for a user who has not chosen a plan', () => {
    expect(entitlementsForPlan(null)).toEqual(entitlementsForPlan('FREE'));
  });

  it('falls back to Free for an unrecognised plan', () => {
    expect(entitlementsForPlan('ENTERPRISE')).toEqual(
      entitlementsForPlan('FREE')
    );
  });
});
