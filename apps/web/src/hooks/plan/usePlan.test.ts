import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const planState = vi.hoisted(() => ({ user: null as unknown }));

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    user: planState.user,
    loading: false,
    updateUser: vi.fn(),
  }),
}));

import { FREE_ENTITLEMENTS, makeUser } from '../../test/fixtures';
import { usePlan } from './usePlan';

beforeEach(() => {
  planState.user = makeUser({ plan: 'FREE', entitlements: FREE_ENTITLEMENTS });
});

describe('usePlan', () => {
  it('reports the limits of the current plan', () => {
    const { result } = renderHook(() => usePlan());

    expect(result.current.isFree).toBe(true);
    expect(result.current.limitFor('maxNetWorthSnapshots')).toBe(1);
    expect(result.current.canExportCsv).toBe(false);
  });

  it('treats a count at the limit as reached', () => {
    const { result } = renderHook(() => usePlan());

    expect(result.current.hasReachedLimit('maxReports', 2)).toBe(false);
    expect(result.current.hasReachedLimit('maxReports', 3)).toBe(true);
  });

  it('never reports a limit as reached on an unlimited plan', () => {
    planState.user = makeUser({ plan: 'PRO' });

    const { result } = renderHook(() => usePlan());

    expect(result.current.isPro).toBe(true);
    expect(result.current.hasReachedLimit('maxReports', 500)).toBe(false);
    expect(result.current.limitFor('maxReports')).toBeNull();
  });

  it('withholds paid capabilities until the user is known', () => {
    planState.user = null;

    const { result } = renderHook(() => usePlan());

    expect(result.current.plan).toBeNull();
    expect(result.current.canShareReports).toBe(false);
    expect(result.current.hasReachedLimit('maxReports', 99)).toBe(false);
  });
});
