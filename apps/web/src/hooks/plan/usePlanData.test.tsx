import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const planState = vi.hoisted(() => ({ user: null as unknown }));
const showError = vi.fn();

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    user: planState.user,
    loading: false,
    updateUser: vi.fn(),
  }),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showError, showInfo: vi.fn(), showSuccess: vi.fn() }),
}));

import { GET_ME, GET_PLANS, SELECT_PLAN } from '../../graphql/user';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makePlanOptions, makeUser } from '../../test/fixtures';
import { type Plan } from '../../types/plan';
import { usePlanData } from './usePlanData';

const plansMock: MockLink.MockedResponse = {
  request: { query: GET_PLANS },
  result: { data: { plans: makePlanOptions() } },
};

const meMock: MockLink.MockedResponse = {
  request: { query: GET_ME },
  result: { data: { me: makeUser({ plan: 'PRO' }) } },
};

function selectMock(plan: Plan): MockLink.MockedResponse {
  return {
    request: { query: SELECT_PLAN, variables: { input: { plan } } },
    result: { data: { selectPlan: makeUser({ plan }) } },
  };
}

function renderPlanData(mocks: Array<MockLink.MockedResponse>) {
  return renderHook(() => usePlanData(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    ),
  });
}

beforeEach(() => {
  showError.mockReset();
  planState.user = makeUser({ plan: null });
});

describe('usePlanData', () => {
  it('starts in a loading state', () => {
    const { result } = renderPlanData([plansMock]);

    expect(result.current.loading).toBe(true);
    expect(result.current.comparison).toEqual([]);
  });

  it('surfaces an error when the plans cannot be loaded', async () => {
    const { result } = renderPlanData([
      { request: { query: GET_PLANS }, error: new Error('boom') },
    ]);

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it('returns the comparison rows and the current plan', async () => {
    const { result } = renderPlanData([plansMock]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.currentPlan).toBeNull();
    expect(result.current.comparison.length).toBeGreaterThan(0);
  });

  it('reports a successful plan change', async () => {
    const { result } = renderPlanData([plansMock, selectMock('PRO'), meMock]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    let hasChanged = false;
    await act(async () => {
      hasChanged = await result.current.onSelectPlan('PRO');
    });

    expect(hasChanged).toBe(true);
    expect(showError).not.toHaveBeenCalled();
  });

  it('shows an error toast when the plan change fails', async () => {
    const { result } = renderPlanData([
      plansMock,
      {
        request: { query: SELECT_PLAN, variables: { input: { plan: 'PRO' } } },
        error: new Error('boom'),
      },
    ]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    let hasChanged = true;
    await act(async () => {
      hasChanged = await result.current.onSelectPlan('PRO');
    });

    expect(hasChanged).toBe(false);
    expect(showError).toHaveBeenCalledWith(
      'Failed to change your plan. Please try again.'
    );
  });
});
