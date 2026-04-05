import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  CANCEL_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  GET_SUBSCRIPTIONS,
  UPDATE_SUBSCRIPTION,
} from '../graphql/subscriptions';
import { MockedProvider } from '../test/apollo-test-utils';
import { Subscription } from '../types/subscription';
import { PAGE_SIZE, useSubscriptionsData } from './useSubscriptionsData';

const mockSubscription = (
  overrides: Partial<Subscription> = {}
): Subscription => ({
  id: '1',
  name: 'Netflix',
  amount: 15.99,
  billingCycle: 'MONTHLY',
  isActive: true,
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: null,
  monthlyCost: 15.99,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const mockYearlySubscription = mockSubscription({
  id: '2',
  name: 'YouTube Premium',
  amount: 120,
  billingCycle: 'YEARLY',
  monthlyCost: 10,
  startDate: '2025-03-01T00:00:00.000Z',
  endDate: '2026-03-01T00:00:00.000Z',
  createdAt: '2025-03-01T00:00:00.000Z',
  updatedAt: '2025-03-01T00:00:00.000Z',
});

const mockActiveQuery: MockLink.MockedResponse = {
  request: { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: true } },
  result: {
    data: {
      subscriptions: {
        items: [mockSubscription(), mockYearlySubscription],
        totalCount: 2,
      },
    },
  },
};

const mockActiveQueryEmpty: MockLink.MockedResponse = {
  request: { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: true } },
  result: { data: { subscriptions: { items: [], totalCount: 0 } } },
};

const mockInactiveQueryEmpty: MockLink.MockedResponse = {
  request: { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: false } },
  result: { data: { subscriptions: { items: [], totalCount: 0 } } },
};

const mockActiveQueryPage2: MockLink.MockedResponse = {
  request: { query: GET_SUBSCRIPTIONS, variables: { page: 2, active: true } },
  result: {
    data: {
      subscriptions: {
        items: [mockSubscription({ id: '3', name: 'Hulu' })],
        totalCount: 11,
      },
    },
  },
};

const mockActiveQueryLarge: MockLink.MockedResponse = {
  request: { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: true } },
  result: {
    data: {
      subscriptions: {
        items: [mockSubscription(), mockYearlySubscription],
        totalCount: 25,
      },
    },
  },
};

const createWrapper =
  (mocks: Array<MockLink.MockedResponse>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useSubscriptionsData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });
    expect(result.current.activeLoading).toBe(true);
  });

  it('returns active subscriptions after loading', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    expect(result.current.activeItems).toHaveLength(2);
    expect(result.current.activeItems[0].name).toBe('Netflix');
    expect(result.current.activeItems[1].name).toBe('YouTube Premium');
  });

  it('returns zero items and counts when no active subscriptions exist', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQueryEmpty, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    expect(result.current.activeItems).toHaveLength(0);
    expect(result.current.activeTotalCount).toBe(0);
    expect(result.current.activeTotalPages).toBe(0);
  });

  it('calculates totalMonthlyCost and totalYearlyCost from active items', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    // Netflix: 15.99/mo + YouTube Premium: 10/mo = 25.99/mo
    expect(result.current.totalMonthlyCost).toBeCloseTo(25.99);
    expect(result.current.totalYearlyCost).toBeCloseTo(25.99 * 12);
  });

  it('returns zero costs when no active subscriptions', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQueryEmpty, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    expect(result.current.totalMonthlyCost).toBe(0);
    expect(result.current.totalYearlyCost).toBe(0);
  });

  it('calculates activeTotalPages from totalCount and PAGE_SIZE', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQueryLarge, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    expect(result.current.activeTotalCount).toBe(25);
    expect(result.current.activeTotalPages).toBe(Math.ceil(25 / PAGE_SIZE));
  });

  it('starts with create modal closed', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });
    expect(result.current.isCreateOpen).toBe(false);
  });

  it('opens and closes create modal', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    act(() => result.current.onOpenCreate());
    expect(result.current.isCreateOpen).toBe(true);

    act(() => result.current.onCloseCreate());
    expect(result.current.isCreateOpen).toBe(false);
  });

  it('starts with inactive section hidden', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });
    expect(result.current.showInactive).toBe(false);
  });

  it('toggles inactive section visibility', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    act(() => result.current.onToggleInactive());
    expect(result.current.showInactive).toBe(true);

    act(() => result.current.onToggleInactive());
    expect(result.current.showInactive).toBe(false);
  });

  it('changes active page via onActivePaginate', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([
        mockActiveQuery,
        mockActiveQueryPage2,
        mockInactiveQueryEmpty,
      ]),
    });

    expect(result.current.activePage).toBe(1);

    act(() => result.current.onActivePaginate(2));
    expect(result.current.activePage).toBe(2);
  });

  it('starts with no subscription selected for edit, cancel, or delete', () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    expect(result.current.subscriptionToEdit).toBeNull();
    expect(result.current.subscriptionToCancel).toBeNull();
    expect(result.current.subscriptionToDelete).toBeNull();
  });

  it('sets subscription for edit via onSelectForEdit', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    const subscription = result.current.activeItems[0];
    act(() => result.current.onSelectForEdit(subscription));
    expect(result.current.subscriptionToEdit).toEqual(subscription);

    act(() => result.current.onSelectForEdit(null));
    expect(result.current.subscriptionToEdit).toBeNull();
  });

  it('sets subscription for cancel via onSelectForCancel', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    const subscription = result.current.activeItems[0];
    act(() => result.current.onSelectForCancel(subscription));
    expect(result.current.subscriptionToCancel).toEqual(subscription);
  });

  it('sets subscription for delete via onSelectForDelete', async () => {
    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([mockActiveQuery, mockInactiveQueryEmpty]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    const subscription = result.current.activeItems[0];
    act(() => result.current.onSelectForDelete(subscription));
    expect(result.current.subscriptionToDelete).toEqual(subscription);
  });

  it('resets to page 1 and closes create modal after creating a subscription', async () => {
    const createMock: MockLink.MockedResponse = {
      request: {
        query: CREATE_SUBSCRIPTION,
        variables: {
          input: {
            name: 'Disney+',
            amount: 8.99,
            billingCycle: 'MONTHLY' as const,
            startDate: '2026-01-15',
          },
        },
      },
      result: {
        data: {
          createSubscription: mockSubscription({
            id: '4',
            name: 'Disney+',
            amount: 8.99,
          }),
        },
      },
    };
    const refetchMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: true },
      },
      result: {
        data: {
          subscriptions: {
            items: [
              mockSubscription({ id: '4', name: 'Disney+', amount: 8.99 }),
            ],
            totalCount: 1,
          },
        },
      },
    };

    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        createMock,
        refetchMock,
      ]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    act(() => result.current.onOpenCreate());
    expect(result.current.isCreateOpen).toBe(true);

    act(() => result.current.onActivePaginate(2));
    expect(result.current.activePage).toBe(2);

    await act(() =>
      result.current.onCreate({
        name: 'Disney+',
        amount: 8.99,
        billingCycle: 'MONTHLY',
        startDate: '2026-01-15',
      })
    );

    expect(result.current.activePage).toBe(1);
    expect(result.current.isCreateOpen).toBe(false);
  });

  it('closes edit modal after updating a subscription', async () => {
    const updateMock: MockLink.MockedResponse = {
      request: {
        query: UPDATE_SUBSCRIPTION,
        variables: {
          input: {
            id: '1',
            name: 'Netflix HD',
            amount: 19.99,
            billingCycle: 'MONTHLY' as const,
            startDate: '2025-01-01',
          },
        },
      },
      result: {
        data: {
          updateSubscription: mockSubscription({
            name: 'Netflix HD',
            amount: 19.99,
          }),
        },
      },
    };
    const refetchActiveMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: true },
      },
      result: {
        data: {
          subscriptions: {
            items: [mockSubscription({ name: 'Netflix HD', amount: 19.99 })],
            totalCount: 1,
          },
        },
      },
    };
    const refetchInactiveMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: false },
      },
      result: { data: { subscriptions: { items: [], totalCount: 0 } } },
    };

    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        updateMock,
        refetchActiveMock,
        refetchInactiveMock,
      ]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    act(() => result.current.onSelectForEdit(result.current.activeItems[0]));
    expect(result.current.subscriptionToEdit).not.toBeNull();

    await act(() =>
      result.current.onUpdate({
        id: '1',
        name: 'Netflix HD',
        amount: 19.99,
        billingCycle: 'MONTHLY',
        startDate: '2025-01-01',
      })
    );

    expect(result.current.subscriptionToEdit).toBeNull();
  });

  it('clears subscriptionToCancel after confirming cancellation', async () => {
    const cancelMock: MockLink.MockedResponse = {
      request: { query: CANCEL_SUBSCRIPTION, variables: { id: '1' } },
      result: { data: { cancelSubscription: { id: '1', isActive: false } } },
    };
    const refetchActiveMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: true },
      },
      result: {
        data: {
          subscriptions: { items: [mockYearlySubscription], totalCount: 1 },
        },
      },
    };
    const refetchInactiveMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: false },
      },
      result: { data: { subscriptions: { items: [], totalCount: 0 } } },
    };

    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        cancelMock,
        refetchActiveMock,
        refetchInactiveMock,
      ]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    act(() => result.current.onSelectForCancel(result.current.activeItems[0]));
    expect(result.current.subscriptionToCancel).not.toBeNull();

    await act(() => result.current.onCancelConfirm());

    expect(result.current.subscriptionToCancel).toBeNull();
  });

  it('clears subscriptionToDelete after confirming deletion', async () => {
    const deleteMock: MockLink.MockedResponse = {
      request: { query: DELETE_SUBSCRIPTION, variables: { id: '1' } },
      result: { data: { deleteSubscription: true } },
    };
    const refetchActiveMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: true },
      },
      result: {
        data: {
          subscriptions: { items: [mockYearlySubscription], totalCount: 1 },
        },
      },
    };
    const refetchInactiveMock: MockLink.MockedResponse = {
      request: {
        query: GET_SUBSCRIPTIONS,
        variables: { page: 1, active: false },
      },
      result: { data: { subscriptions: { items: [], totalCount: 0 } } },
    };

    const { result } = renderHook(() => useSubscriptionsData(), {
      wrapper: createWrapper([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        deleteMock,
        refetchActiveMock,
        refetchInactiveMock,
      ]),
    });

    await waitFor(() => expect(result.current.activeLoading).toBe(false));

    act(() => result.current.onSelectForDelete(result.current.activeItems[0]));
    expect(result.current.subscriptionToDelete).not.toBeNull();

    await act(() => result.current.onDeleteConfirm());

    expect(result.current.subscriptionToDelete).toBeNull();
  });
});
