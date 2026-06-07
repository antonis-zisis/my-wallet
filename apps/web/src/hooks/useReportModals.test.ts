import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeTransaction } from '../test/fixtures/report';
import { useReportModals } from './useReportModals';

describe('useReportModals', () => {
  it('starts with all flags closed and no transaction selected', () => {
    const { result } = renderHook(() => useReportModals());

    expect(result.current.isChartOpen).toBe(false);
    expect(result.current.isBudgetChartOpen).toBe(false);
    expect(result.current.isAddTransactionModalOpen).toBe(false);
    expect(result.current.isDeleteReportModalOpen).toBe(false);
    expect(result.current.editingTransaction).toBeNull();
    expect(result.current.deletingTransaction).toBeNull();
  });

  it('toggles the expense and budget charts independently', () => {
    const { result } = renderHook(() => useReportModals());

    act(() => result.current.onToggleChart());
    expect(result.current.isChartOpen).toBe(true);
    expect(result.current.isBudgetChartOpen).toBe(false);

    act(() => result.current.onToggleBudgetChart());
    expect(result.current.isBudgetChartOpen).toBe(true);
  });

  it('opens and closes the add-transaction modal', () => {
    const { result } = renderHook(() => useReportModals());

    act(() => result.current.onOpenAddTransactionModal());
    expect(result.current.isAddTransactionModalOpen).toBe(true);

    act(() => result.current.onCloseAddTransactionModal());
    expect(result.current.isAddTransactionModalOpen).toBe(false);
  });

  it('opens and closes the delete-report modal', () => {
    const { result } = renderHook(() => useReportModals());

    act(() => result.current.onOpenDeleteReportModal());
    expect(result.current.isDeleteReportModalOpen).toBe(true);

    act(() => result.current.onCloseDeleteReportModal());
    expect(result.current.isDeleteReportModalOpen).toBe(false);
  });

  it('selects a transaction for editing and clears it', () => {
    const transaction = makeTransaction();
    const { result } = renderHook(() => useReportModals());

    act(() => result.current.onSelectTransactionForEdit(transaction));
    expect(result.current.editingTransaction).toEqual(transaction);

    act(() => result.current.onCloseEditTransactionModal());
    expect(result.current.editingTransaction).toBeNull();
  });

  it('selects a transaction for deletion and clears it', () => {
    const transaction = makeTransaction();
    const { result } = renderHook(() => useReportModals());

    act(() => result.current.onSelectTransactionForDelete(transaction));
    expect(result.current.deletingTransaction).toEqual(transaction);

    act(() => result.current.onCloseDeleteTransactionModal());
    expect(result.current.deletingTransaction).toBeNull();
  });
});
