import { MockLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const showSuccess = vi.fn();
const showError = vi.fn();
const showInfo = vi.fn();

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showSuccess, showError, showInfo }),
}));

import { GET_ADMIN_USERS } from '../../graphql/admin';
import { PAGE_SIZE } from '../../hooks/admin/useAdminUsersData';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makeAdminUser, makeAdminUserCounts } from '../../test/fixtures';
import { AdminUser } from '../../types/admin';
import { AdminUsers } from './AdminUsers';

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

const listMock = (users: Array<AdminUser>): MockLink.MockedResponse => ({
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

function renderPage(mocks: Array<MockLink.MockedResponse>) {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    </MockedProvider>
  );
}

describe('AdminUsers', () => {
  it('shows a skeleton while loading', () => {
    renderPage([listMock([])]);

    expect(screen.getByTestId('admin-user-list-skeleton')).toBeInTheDocument();
  });

  it('shows an error message when the query fails', async () => {
    renderPage([listErrorMock()]);

    expect(
      await screen.findByText('Failed to load users.')
    ).toBeInTheDocument();
  });

  it('shows an empty state when there are no users', async () => {
    renderPage([listMock([])]);

    expect(await screen.findByText('No users yet.')).toBeInTheDocument();
  });

  it('lists the registered users', async () => {
    renderPage([listMock([makeAdminUser({ fullName: 'Ada Lovelace' })])]);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/1 registered account/)).toBeInTheDocument();
  });

  it('keeps delete disabled until the email is typed exactly', async () => {
    const user = makeAdminUser({
      email: 'ada@example.com',
      counts: makeAdminUserCounts({ reports: 3 }),
    });
    renderPage([listMock([user])]);

    await screen.findByText('Ada Lovelace');
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete ada@example.com' })
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Delete permanently',
    });
    expect(screen.getByText('3 reports')).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText('Type ada@example.com to confirm'),
      'ada@example.com'
    );

    await waitFor(() => expect(confirmButton).toBeEnabled());
  });

  it('does not offer deletion for a superadmin', async () => {
    renderPage([
      listMock([makeAdminUser({ fullName: 'Root', role: 'SUPERADMIN' })]),
    ]);

    await screen.findByText('Root');

    expect(
      screen.getByRole('button', { name: 'Delete ada@example.com' })
    ).toBeDisabled();
  });
});
