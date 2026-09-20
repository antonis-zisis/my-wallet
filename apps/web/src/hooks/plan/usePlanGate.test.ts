import { act, renderHook } from '@testing-library/react';
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
import { usePlanGate } from './usePlanGate';

beforeEach(() => {
  planState.user = makeUser({ plan: 'FREE', entitlements: FREE_ENTITLEMENTS });
});

describe('usePlanGate', () => {
  it('runs the action while there is room left', () => {
    const action = vi.fn();
    const { result } = renderHook(() => usePlanGate());

    act(() => result.current.guardLimit('maxReports', 1, action)());

    expect(action).toHaveBeenCalled();
    expect(result.current.upgradeMessage).toBeNull();
  });

  it('explains the limit instead of running the action at the cap', () => {
    const action = vi.fn();
    const { result } = renderHook(() => usePlanGate());

    act(() => result.current.guardLimit('maxNetWorthSnapshots', 1, action)());

    expect(action).not.toHaveBeenCalled();
    expect(result.current.upgradeMessage).toBe(
      'You have used all 1 net worth snapshots the Free plan includes. Upgrade to Pro for unlimited net worth snapshots.'
    );
  });

  it('blocks a capability the plan does not include', () => {
    const action = vi.fn();
    const { result } = renderHook(() => usePlanGate());

    act(() => result.current.guardCapability('canExportCsv', action)());

    expect(action).not.toHaveBeenCalled();
    expect(result.current.upgradeMessage).toBe(
      'Exporting a report to CSV is part of Pro.'
    );
  });

  it('runs a capability action on a plan that includes it', () => {
    planState.user = makeUser({ plan: 'PRO' });
    const action = vi.fn();
    const { result } = renderHook(() => usePlanGate());

    act(() => result.current.guardCapability('canShareReports', action)());

    expect(action).toHaveBeenCalled();
    expect(result.current.upgradeMessage).toBeNull();
  });

  it('clears the message when the prompt is dismissed', () => {
    const { result } = renderHook(() => usePlanGate());

    act(() => result.current.showUpgrade('Pro only'));
    expect(result.current.upgradeMessage).toBe('Pro only');

    act(() => result.current.onCloseUpgrade());

    expect(result.current.upgradeMessage).toBeNull();
  });
});
