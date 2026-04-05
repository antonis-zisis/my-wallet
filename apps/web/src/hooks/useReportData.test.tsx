import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GET_REPORT } from '../graphql/reports';
import {
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
} from '../graphql/transactions';
import { MockedProvider } from '../test/apollo-test-utils';
import { Transaction } from '../types/transaction';
import { useReportData } from './useReportData';

const mockTransaction = (
  id: string,
  type: 'INCOME' | 'EXPENSE'
): Transaction => ({
  amount: 100,
  category: 'Test',
  createdAt: '2024-01-15T00:00:00.000Z',
  date: '2024-01-15T00:00:00.000Z',
  description: `Transaction ${id}`,
  id,
  reportId: '1',
  type,
  updatedAt: '2024-01-15T00:00:00.000Z',
});

const incomeTransaction = mockTransaction('t1', 'INCOME');
const expenseTransaction = mockTransaction('t2', 'EXPENSE');

const mockReportQuery: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: '1' } },
  result: {
    data: {
      report: {
        id: '1',
        title: 'January Budget',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        transactions: [incomeTransaction, expenseTransaction],
      },
    },
  },
};

const mockReportQueryError: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: '1' } },
  result: { errors: [new GraphQLError('Failed to load report')] },
};

const createTransactionMock: MockLink.MockedResponse = {
  request: {
    query: CREATE_TRANSACTION,
    variables: {
      input: {
        amount: 200,
        category: 'Food',
        date: '2024-01-20',
        description: 'Lunch',
        reportId: '1',
        type: 'EXPENSE',
      },
    },
  },
  result: {
    data: {
      createTransaction: mockTransaction('t3', 'EXPENSE'),
    },
  },
};

const deleteTransactionMock: MockLink.MockedResponse = {
  request: {
    query: DELETE_TRANSACTION,
    variables: { id: 't2' },
  },
  result: { data: { deleteTransaction: true } },
};

const refetchAfterMutationMock: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: '1' } },
  result: {
    data: {
      report: {
        id: '1',
        title: 'January Budget',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        transactions: [incomeTransaction],
      },
    },
  },
};

const createWrapper =
  (mocks: Array<MockLink.MockedResponse>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/reports/1']}>
        <Routes>
          <Route path="/reports/:id" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

describe('useReportData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useReportData(), {
      wrapper: createWrapper([mockReportQuery]),
    });
    expect(result.current.loading).toBe(true);
  });

  it('returns report and transactions after loading', async () => {
    const { result } = renderHook(() => useReportData(), {
      wrapper: createWrapper([mockReportQuery]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.report?.title).toBe('January Budget');
    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.transactions[0].id).toBe('t1');
    expect(result.current.transactions[1].id).toBe('t2');
  });

  it('returns error flag on query failure', async () => {
    const { result } = renderHook(() => useReportData(), {
      wrapper: createWrapper([mockReportQueryError]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.report).toBeUndefined();
  });

  describe('chart toggles', () => {
    it('starts with both charts collapsed', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });
      expect(result.current.isChartOpen).toBe(false);
      expect(result.current.isBudgetChartOpen).toBe(false);
    });

    it('toggles expense chart open and closed', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() => result.current.onToggleChart());
      expect(result.current.isChartOpen).toBe(true);

      act(() => result.current.onToggleChart());
      expect(result.current.isChartOpen).toBe(false);
    });

    it('toggles budget chart open and closed', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() => result.current.onToggleBudgetChart());
      expect(result.current.isBudgetChartOpen).toBe(true);

      act(() => result.current.onToggleBudgetChart());
      expect(result.current.isBudgetChartOpen).toBe(false);
    });

    it('toggles each chart independently', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() => result.current.onToggleChart());
      expect(result.current.isChartOpen).toBe(true);
      expect(result.current.isBudgetChartOpen).toBe(false);
    });
  });

  describe('add transaction modal', () => {
    it('starts closed', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });
      expect(result.current.isAddTransactionModalOpen).toBe(false);
    });

    it('opens and closes', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() => result.current.onOpenAddTransactionModal());
      expect(result.current.isAddTransactionModalOpen).toBe(true);

      act(() => result.current.onCloseAddTransactionModal());
      expect(result.current.isAddTransactionModalOpen).toBe(false);
    });

    it('closes after creating a transaction', async () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([
          mockReportQuery,
          createTransactionMock,
          refetchAfterMutationMock,
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.onOpenAddTransactionModal());
      expect(result.current.isAddTransactionModalOpen).toBe(true);

      await act(() =>
        result.current.onCreateTransaction({
          amount: 200,
          category: 'Food',
          date: '2024-01-20',
          description: 'Lunch',
          type: 'EXPENSE',
        })
      );

      expect(result.current.isAddTransactionModalOpen).toBe(false);
    });
  });

  describe('delete report modal', () => {
    it('starts closed', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });
      expect(result.current.isDeleteReportModalOpen).toBe(false);
    });

    it('opens and closes', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() => result.current.onOpenDeleteReportModal());
      expect(result.current.isDeleteReportModalOpen).toBe(true);

      act(() => result.current.onCloseDeleteReportModal());
      expect(result.current.isDeleteReportModalOpen).toBe(false);
    });
  });

  describe('transaction editing', () => {
    it('starts with no transaction selected for editing', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });
      expect(result.current.editingTransaction).toBeNull();
    });

    it('selects a transaction for editing and clears it', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() => result.current.onSelectTransactionForEdit(incomeTransaction));
      expect(result.current.editingTransaction).toEqual(incomeTransaction);

      act(() => result.current.onCloseEditTransactionModal());
      expect(result.current.editingTransaction).toBeNull();
    });
  });

  describe('transaction deletion', () => {
    it('starts with no transaction selected for deletion', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });
      expect(result.current.deletingTransaction).toBeNull();
    });

    it('selects a transaction for deletion and clears it', () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([mockReportQuery]),
      });

      act(() =>
        result.current.onSelectTransactionForDelete(expenseTransaction)
      );
      expect(result.current.deletingTransaction).toEqual(expenseTransaction);

      act(() => result.current.onCloseDeleteTransactionModal());
      expect(result.current.deletingTransaction).toBeNull();
    });

    it('clears selected transaction after confirming deletion', async () => {
      const { result } = renderHook(() => useReportData(), {
        wrapper: createWrapper([
          mockReportQuery,
          deleteTransactionMock,
          refetchAfterMutationMock,
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() =>
        result.current.onSelectTransactionForDelete(expenseTransaction)
      );
      expect(result.current.deletingTransaction).toEqual(expenseTransaction);

      await act(() => result.current.onConfirmDeleteTransaction());
      expect(result.current.deletingTransaction).toBeNull();
    });
  });
});
