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
import { PAGE_SIZE, useContractsData } from './useContractsData';

beforeEach(() => {
  showSuccess.mockReset();
  showError.mockReset();
  showInfo.mockReset();
});

const baseVariables = {
  page: 1,
  pageSize: PAGE_SIZE,
  sortBy: 'END_DATE',
  sortOrder: 'ASC',
};

const mockQuery: MockLink.MockedResponse = {
  request: { query: GET_CONTRACTS, variables: baseVariables },
  result: {
    data: {
      contracts: { items: [makeContract()], totalCount: 1 },
    },
  },
};

const mockQueryEmpty: MockLink.MockedResponse = {
  request: { query: GET_CONTRACTS, variables: baseVariables },
  result: { data: { contracts: { items: [], totalCount: 0 } } },
};

const createWrapper =
  (mocks: Array<MockLink.MockedResponse>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useContractsData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([mockQuery]),
    });

    expect(result.current.loading).toBe(true);
  });

  it('surfaces an error flag when the query fails', async () => {
    const errorMock: MockLink.MockedResponse = {
      request: { query: GET_CONTRACTS, variables: baseVariables },
      error: new Error('network'),
    };

    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([errorMock]),
    });

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it('returns the loaded contracts and counts', async () => {
    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([mockQuery]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].provider).toBe('DEI');
    expect(result.current.totalCount).toBe(1);
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
      wrapper: createWrapper([mockQueryEmpty, createMock, mockQueryEmpty]),
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

  it('shows an error toast when creating a contract fails', async () => {
    const createErrorMock: MockLink.MockedResponse = {
      request: {
        query: CREATE_CONTRACT,
        variables: { input: { category: 'Internet', provider: 'Cosmote' } },
      },
      error: new Error('boom'),
    };

    const { result } = renderHook(() => useContractsData(), {
      wrapper: createWrapper([mockQueryEmpty, createErrorMock]),
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
