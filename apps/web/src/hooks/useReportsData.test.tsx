import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../contexts/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

import { CREATE_REPORT, GET_REPORTS } from '../graphql/reports';
import { MockedProvider } from '../test/apollo-test-utils';
import { PAGE_SIZE, useReportsData } from './useReportsData';

const mockReport = (id: string, title: string) => ({
  id,
  isLocked: false,
  title,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const mockReportsPage1: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 1, pageSize: PAGE_SIZE } },
  result: {
    data: {
      reports: {
        items: [mockReport('1', 'January'), mockReport('2', 'February')],
        totalCount: 12,
      },
    },
  },
};

const mockReportsPage2: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 2, pageSize: PAGE_SIZE } },
  result: {
    data: {
      reports: {
        items: [mockReport('3', 'March')],
        totalCount: 12,
      },
    },
  },
};

const emptyReportsMock: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 1, pageSize: PAGE_SIZE } },
  result: { data: { reports: { items: [], totalCount: 0 } } },
};

const createReportMock: MockLink.MockedResponse = {
  request: {
    query: CREATE_REPORT,
    variables: { input: { title: 'New Report' } },
  },
  result: {
    data: {
      createReport: mockReport('3', 'New Report'),
    },
  },
};

const refetchAfterCreateMock: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 1, pageSize: PAGE_SIZE } },
  result: {
    data: {
      reports: {
        items: [
          mockReport('3', 'New Report'),
          mockReport('1', 'January'),
          mockReport('2', 'February'),
        ],
        totalCount: 13,
      },
    },
  },
};

const createWrapper =
  (mocks: Array<MockLink.MockedResponse>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useReportsData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([mockReportsPage1]),
    });
    expect(result.current.loading).toBe(true);
  });

  it('returns reports after loading', async () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([mockReportsPage1]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reports).toHaveLength(2);
    expect(result.current.reports[0].title).toBe('January');
    expect(result.current.reports[1].title).toBe('February');
  });

  it('calculates totalPages correctly from totalCount and PAGE_SIZE', async () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([mockReportsPage1]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalCount).toBe(12);
    expect(result.current.totalPages).toBe(Math.ceil(12 / PAGE_SIZE));
  });

  it('returns empty reports and zero totals when no reports exist', async () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([emptyReportsMock]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reports).toHaveLength(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.totalPages).toBe(0);
  });

  it('starts with modal closed', () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([mockReportsPage1]),
    });
    expect(result.current.isModalOpen).toBe(false);
  });

  it('opens and closes the modal', () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([mockReportsPage1]),
    });

    act(() => result.current.onOpenModal());
    expect(result.current.isModalOpen).toBe(true);

    act(() => result.current.onCloseModal());
    expect(result.current.isModalOpen).toBe(false);
  });

  it('changes page via onPageChange', async () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([mockReportsPage1, mockReportsPage2]),
    });

    expect(result.current.page).toBe(1);

    act(() => result.current.onPageChange(2));
    expect(result.current.page).toBe(2);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('resets to page 1 and closes modal after creating a report', async () => {
    const { result } = renderHook(() => useReportsData(), {
      wrapper: createWrapper([
        mockReportsPage1,
        mockReportsPage2,
        createReportMock,
        refetchAfterCreateMock,
      ]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.onOpenModal());
    expect(result.current.isModalOpen).toBe(true);

    act(() => result.current.onPageChange(2));
    expect(result.current.page).toBe(2);

    await act(() => result.current.onCreateReport('New Report'));

    expect(result.current.page).toBe(1);
    expect(result.current.isModalOpen).toBe(false);
  });
});
