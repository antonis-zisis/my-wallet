import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const showSuccess = vi.fn();
const showError = vi.fn();
const showInfo = vi.fn();

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showSuccess, showError, showInfo }),
}));

import { CREATE_CONTRACT, GET_CONTRACTS } from '../../graphql/contracts';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makeContract } from '../../test/fixtures/contracts';
import { Contract } from '../../types/contract';
import { PAGE_SIZE, useContractsData } from './useContractsData';

beforeEach(() => {
  showSuccess.mockReset();
  showError.mockReset();
  showInfo.mockReset();
});

const activeVariables = {
  expired: false,
  page: 1,
  pageSize: PAGE_SIZE,
  sortBy: 'END_DATE',
  sortOrder: 'ASC',
};

const expiredVariables = {
  expired: true,
  page: 1,
  pageSize: PAGE_SIZE,
  sortBy: 'END_DATE',
  sortOrder: 'DESC',
};

type ListMockOptions = {
  contracts?: Array<Contract>;
  search?: string;
};

const activeMock = ({
  contracts = [],
  search,
}: ListMockOptions = {}): MockLink.MockedResponse => ({
  maxUsageCount: Number.POSITIVE_INFINITY,
  request: {
    query: GET_CONTRACTS,
    variables: search ? { ...activeVariables, search } : activeVariables,
  },
  result: {
    data: { contracts: { items: contracts, totalCount: contracts.length } },
  },
});

const expiredMock = ({
  contracts = [],
  search,
}: ListMockOptions = {}): MockLink.MockedResponse => ({
  maxUsageCount: Number.POSITIVE_INFINITY,
  request: {
    query: GET_CONTRACTS,
    variables: search ? { ...expiredVariables, search } : expiredVariables,
  },
  result: {
    data: { contracts: { items: contracts, totalCount: contracts.length } },
  },
});

const createWrapper =
  (mocks: Array<MockLink.MockedResponse>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useContractsData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([
        activeMock({ contracts: [makeContract()] }),
        expiredMock(),
      ]),
    });

    expect(result.current.loading).toBe(true);
  });

  it('surfaces an error flag when the query fails', async () => {
    const errorMock: MockLink.MockedResponse = {
      request: { query: GET_CONTRACTS, variables: activeVariables },
      error: new Error('network'),
    };

    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([errorMock, expiredMock()]),
    });

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it('returns the loaded contracts and counts', async () => {
    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([
        activeMock({ contracts: [makeContract()] }),
        expiredMock(),
      ]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].provider).toBe('DEI');
    expect(result.current.totalCount).toBe(1);
  });

  describe('expired contracts', () => {
    const expiredContract = makeContract({
      id: 'expired-1',
      provider: 'Old Provider',
      endDate: '2020-01-01T00:00:00Z',
      isExpired: true,
    });

    it('keeps expired contracts out of the active list', async () => {
      const { result } = renderHook(() => useContractsData(), {
        wrapper: createWrapper([
          activeMock({ contracts: [makeContract()] }),
          expiredMock({ contracts: [expiredContract] }),
        ]),
      });

      await waitFor(() => expect(result.current.expiredTotalCount).toBe(1));

      expect(result.current.items.map((contract) => contract.id)).toEqual([
        'contract-1',
      ]);
      expect(
        result.current.expiredItems.map((contract) => contract.id)
      ).toEqual(['expired-1']);
    });

    it('starts collapsed and opens when toggled', async () => {
      const { result } = renderHook(() => useContractsData(), {
        wrapper: createWrapper([
          activeMock({ contracts: [makeContract()] }),
          expiredMock({ contracts: [expiredContract] }),
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isExpiredOpen).toBe(false);

      act(() => result.current.onToggleExpired());

      expect(result.current.isExpiredOpen).toBe(true);
    });

    it('forces the section open and uncollapsible while searching', async () => {
      const { result } = renderHook(() => useContractsData(), {
        wrapper: createWrapper([
          activeMock({ contracts: [makeContract()] }),
          expiredMock({ contracts: [expiredContract] }),
          activeMock({ search: 'old' }),
          expiredMock({ contracts: [expiredContract], search: 'old' }),
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.onSearchChange('old'));

      await waitFor(() => expect(result.current.isExpiredOpen).toBe(true));
      expect(result.current.isExpiredCollapsible).toBe(false);
      expect(result.current.expiredItems).toHaveLength(1);
    });

    it('reports when every contract has expired', async () => {
      const { result } = renderHook(() => useContractsData(), {
        wrapper: createWrapper([
          activeMock(),
          expiredMock({ contracts: [expiredContract] }),
        ]),
      });

      await waitFor(() =>
        expect(result.current.hasOnlyExpiredContracts).toBe(true)
      );
    });
  });

  it('shows a success toast after creating a contract', async () => {
    const createMock: MockLink.MockedResponse = {
      request: {
        query: CREATE_CONTRACT,
        variables: { input: { category: 'Internet', provider: 'Cosmote' } },
      },
      result: {
        data: {
          createContract: makeContract({
            id: 'new',
            category: 'Internet',
            provider: 'Cosmote',
          }),
        },
      },
    };

    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([activeMock(), expiredMock(), createMock]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() =>
      result.current.onCreate({
        category: 'Internet',
        provider: 'Cosmote',
      })
    );

    await waitFor(() =>
      expect(showSuccess).toHaveBeenCalledWith('Contract created.')
    );
  });

  it('refetches with a provider search after the debounce', async () => {
    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([
        activeMock({ contracts: [makeContract()] }),
        expiredMock(),
        activeMock({
          contracts: [makeContract({ id: '7', provider: 'Cosmote' })],
          search: 'cosmote',
        }),
        expiredMock({ search: 'cosmote' }),
      ]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.onSearchChange('cosmote'));

    await waitFor(() =>
      expect(result.current.items[0]?.provider).toBe('Cosmote')
    );
    expect(result.current.search).toBe('cosmote');
    expect(result.current.page).toBe(1);
  });

  it('shows an error toast when creating a contract fails', async () => {
    const createErrorMock: MockLink.MockedResponse = {
      request: {
        query: CREATE_CONTRACT,
        variables: { input: { category: 'Internet', provider: 'Cosmote' } },
      },
      error: new Error('boom'),
    };

    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([activeMock(), expiredMock(), createErrorMock]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() =>
      result.current.onCreate({
        category: 'Internet',
        provider: 'Cosmote',
      })
    );

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith('Failed to create contract.')
    );
  });
});
