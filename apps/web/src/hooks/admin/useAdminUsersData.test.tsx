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

import { ADMIN_DELETE_USER, GET_ADMIN_USERS } from '../../graphql/admin';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makeAdminUser } from '../../test/fixtures';
import { AdminUser } from '../../types/admin';
import { PAGE_SIZE, useAdminUsersData } from './useAdminUsersData';

beforeEach(() => {
  showSuccess.mockReset();
  showError.mockReset();
  showInfo.mockReset();
});

const listVariables = {
  page: 1,
  pageSize: PAGE_SIZE,
  sortBy: 'CREATED_AT',
  sortOrder: 'DESC',
};

const listMock = (users: Array<AdminUser> = []): MockLink.MockedResponse => ({
  maxUsageCount: Number.POSITIVE_INFINITY,
  request: { query: GET_ADMIN_USERS, variables: listVariables },
  result: {
    data: { adminUsers: { items: users, totalCount: users.length } },
  },
});

const listErrorMock = (): MockLink.MockedResponse => ({
  request: { query: GET_ADMIN_USERS, variables: listVariables },
  error: new Error('boom'),
});

const deleteMock = (
  user: AdminUser,
  outcome: 'success' | 'failure'
): MockLink.MockedResponse => ({
  request: {
    query: ADMIN_DELETE_USER,
    variables: {
      input: { confirmEmail: user.email, supabaseId: user.supabaseId },
    },
  },
  ...(outcome === 'success'
    ? { result: { data: { adminDeleteUser: true } } }
    : { error: new Error('boom') }),
});

function createWrapper(mocks: Array<MockLink.MockedResponse>) {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
}

describe('useAdminUsersData', () => {
  it('starts in a loading state', () => {
    const { result } = renderHook(() => useAdminUsersData(), {
      wrapper: createWrapper([listMock()]),
    });

    expect(result.current.loading).toBe(true);
  });

  it('surfaces a failed query', async () => {
    const { result } = renderHook(() => useAdminUsersData(), {
      wrapper: createWrapper([listErrorMock()]),
    });

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it('returns the users and total count', async () => {
    const user = makeAdminUser({ email: 'ada@example.com' });

    const { result } = renderHook(() => useAdminUsersData(), {
      wrapper: createWrapper([listMock([user])]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.totalCount).toBe(1);
    expect(result.current.items[0].email).toBe('ada@example.com');
  });

  it('confirms deletion with a success toast', async () => {
    const user = makeAdminUser();

    const { result } = renderHook(() => useAdminUsersData(), {
      wrapper: createWrapper([listMock([user]), deleteMock(user, 'success')]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.onSelectForDelete(user));
    await act(() => result.current.onDeleteConfirm(user.email));

    expect(showSuccess).toHaveBeenCalledWith(`${user.email} deleted.`);
    expect(result.current.userToDelete).toBeNull();
  });

  it('shows an error toast when deletion fails', async () => {
    const user = makeAdminUser();

    const { result } = renderHook(() => useAdminUsersData(), {
      wrapper: createWrapper([listMock([user]), deleteMock(user, 'failure')]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.onSelectForDelete(user));
    await act(() => result.current.onDeleteConfirm(user.email));

    expect(showError).toHaveBeenCalledWith('Failed to delete user.');
    expect(result.current.userToDelete).not.toBeNull();
  });
});
