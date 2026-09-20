import { describe, expect, it } from 'vitest';

import { makePlanOptions } from '../../../test/fixtures';
import { buildPlanComparison } from './buildPlanComparison';

describe('buildPlanComparison', () => {
  it('pairs each feature with its value on both plans', () => {
    const rows = buildPlanComparison(makePlanOptions());

    expect(rows).toContainEqual({
      label: 'Net worth snapshots',
      free: '1',
      pro: 'Unlimited',
    });
    expect(rows).toContainEqual({
      label: 'Category trends history',
      free: '3 months',
      pro: '12 months',
    });
  });

  it('spells out capabilities rather than showing a bare flag', () => {
    const rows = buildPlanComparison(makePlanOptions());

    expect(rows).toContainEqual({
      label: 'CSV export',
      free: 'Not included',
      pro: 'Included',
    });
  });

  it('keeps unlimited transactions on both plans', () => {
    const rows = buildPlanComparison(makePlanOptions());

    expect(rows).toContainEqual({
      label: 'Transactions per report',
      free: 'Unlimited',
      pro: 'Unlimited',
    });
  });

  it('returns no rows until both plans are known', () => {
    expect(buildPlanComparison([])).toEqual([]);
  });
});
