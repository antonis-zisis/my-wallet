import { MockLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import {
  CANCEL_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  GET_SUBSCRIPTIONS,
} from '../graphql/subscriptions';
import { MockedProvider } from '../test/apollo-test-utils';
import { Subscriptions } from './Subscriptions';

const mockSubscription = {
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
};

const mockYearlySubscription = {
  id: '2',
  name: 'YouTube Premium',
  amount: 120,
  billingCycle: 'YEARLY',
  isActive: true,
  startDate: '2025-03-01T00:00:00.000Z',
  endDate: '2026-03-01T00:00:00.000Z',
  monthlyCost: 10,
  createdAt: '2025-03-01T00:00:00.000Z',
  updatedAt: '2025-03-01T00:00:00.000Z',
};

const mockInactiveSubscription = {
  id: '3',
  name: 'Spotify',
  amount: 9.99,
  billingCycle: 'MONTHLY',
  isActive: false,
  startDate: '2024-06-01T00:00:00.000Z',
  endDate: null,
  monthlyCost: 9.99,
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
};

const mockActiveQuery: MockLink.MockedResponse = {
  request: {
    query: GET_SUBSCRIPTIONS,
    variables: { page: 1, active: true },
  },
  result: {
    data: {
      subscriptions: {
        items: [mockSubscription, mockYearlySubscription],
        totalCount: 2,
      },
    },
  },
};

const mockInactiveQuery: MockLink.MockedResponse = {
  request: {
    query: GET_SUBSCRIPTIONS,
    variables: { page: 1, active: false },
  },
  result: {
    data: {
      subscriptions: {
        items: [mockInactiveSubscription],
        totalCount: 1,
      },
    },
  },
};

const mockActiveQueryEmpty: MockLink.MockedResponse = {
  request: {
    query: GET_SUBSCRIPTIONS,
    variables: { page: 1, active: true },
  },
  result: {
    data: {
      subscriptions: { items: [], totalCount: 0 },
    },
  },
};

const mockInactiveQueryEmpty: MockLink.MockedResponse = {
  request: {
    query: GET_SUBSCRIPTIONS,
    variables: { page: 1, active: false },
  },
  result: {
    data: {
      subscriptions: { items: [], totalCount: 0 },
    },
  },
};

const mockActiveQueryError: MockLink.MockedResponse = {
  request: {
    query: GET_SUBSCRIPTIONS,
    variables: { page: 1, active: true },
  },
  result: {
    errors: [new GraphQLError('Failed to load subscriptions')],
  },
};

const renderSubscriptions = (mocks: Array<MockLink.MockedResponse>) => {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Subscriptions />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('Subscriptions', () => {
  it('shows loading state initially', () => {
    renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
    expect(screen.getByText('Loading subscriptions...')).toBeInTheDocument();
  });

  it('renders active subscriptions after loading', async () => {
    renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
    expect(await screen.findByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('YouTube Premium')).toBeInTheDocument();
  });

  it('shows billing cycle badges', async () => {
    renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
    await screen.findByText('Netflix');
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  it('shows total monthly cost', async () => {
    renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
    await screen.findByText('Netflix');
    expect(screen.getByText('Total monthly cost:')).toBeInTheDocument();
    expect(screen.getByText('25,99 €')).toBeInTheDocument();
  });

  it('shows empty state when no active subscriptions exist', async () => {
    renderSubscriptions([mockActiveQueryEmpty, mockInactiveQueryEmpty]);
    expect(
      await screen.findByText('No active subscriptions. Add your first one!')
    ).toBeInTheDocument();
  });

  it('shows error state on query failure', async () => {
    renderSubscriptions([mockActiveQueryError, mockInactiveQueryEmpty]);
    expect(
      await screen.findByText('Failed to load subscriptions.')
    ).toBeInTheDocument();
  });

  it('has New Subscription button', () => {
    renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
    expect(
      screen.getByRole('button', { name: 'New Subscription' })
    ).toBeInTheDocument();
  });

  describe('inactive subscriptions', () => {
    it('shows inactive section toggle when inactive subscriptions exist', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQuery]);
      expect(
        await screen.findByText(/Inactive Subscriptions/)
      ).toBeInTheDocument();
    });

    it('expands inactive section on click', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQuery]);
      await screen.findByText('Netflix');

      await userEvent.click(screen.getByText(/Inactive Subscriptions/));

      expect(await screen.findByText('Spotify')).toBeInTheDocument();
    });
  });

  describe('create subscription modal', () => {
    it('opens modal when New Subscription is clicked', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
      await userEvent.click(
        screen.getByRole('button', { name: 'New Subscription' })
      );
      expect(
        screen.getByRole('heading', { name: 'New Subscription' })
      ).toBeInTheDocument();
    });

    it('closes modal when Cancel is clicked', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
      await userEvent.click(
        screen.getByRole('button', { name: 'New Subscription' })
      );
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'New Subscription' })
        ).not.toBeInTheDocument();
      });
    });

    it('Create button is disabled when form is empty', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
      await userEvent.click(
        screen.getByRole('button', { name: 'New Subscription' })
      );
      expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    });

    it('submits new subscription and closes modal', async () => {
      const createMock: MockLink.MockedResponse = {
        request: {
          query: CREATE_SUBSCRIPTION,
          variables: {
            input: {
              name: 'Disney+',
              amount: 8.99,
              billingCycle: 'MONTHLY',
              startDate: '2026-01-15',
            },
          },
        },
        result: {
          data: {
            createSubscription: {
              id: '4',
              name: 'Disney+',
              amount: 8.99,
              billingCycle: 'MONTHLY',
              isActive: true,
              startDate: '2026-01-15T00:00:00.000Z',
              endDate: null,
              monthlyCost: 8.99,
              createdAt: '2026-01-15T00:00:00.000Z',
              updatedAt: '2026-01-15T00:00:00.000Z',
            },
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
              items: [mockSubscription],
              totalCount: 1,
            },
          },
        },
      };

      renderSubscriptions([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        createMock,
        refetchMock,
      ]);

      await userEvent.click(
        screen.getByRole('button', { name: 'New Subscription' })
      );

      await userEvent.type(
        screen.getByPlaceholderText('e.g. Netflix'),
        'Disney+'
      );
      await userEvent.type(screen.getByPlaceholderText('9.99'), '8.99');
      await userEvent.type(screen.getByLabelText('Start Date'), '2026-01-15');

      await userEvent.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'Create' })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('cancel subscription modal', () => {
    it('opens cancel modal from dropdown menu', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
      await screen.findByText('Netflix');

      const optionButtons = screen.getAllByRole('button', { name: 'Options' });
      await userEvent.click(optionButtons[0]);
      await userEvent.click(screen.getByText('Cancel'));

      expect(
        screen.getByRole('heading', { name: 'Cancel Subscription' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to cancel/)
      ).toBeInTheDocument();
    });

    it('closes cancel modal when Keep is clicked', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
      await screen.findByText('Netflix');

      const optionButtons = screen.getAllByRole('button', { name: 'Options' });
      await userEvent.click(optionButtons[0]);
      await userEvent.click(screen.getByText('Cancel'));

      await userEvent.click(screen.getByRole('button', { name: 'Keep' }));

      expect(screen.queryByText('Cancel Subscription')).not.toBeInTheDocument();
    });

    it('cancels subscription on confirm', async () => {
      const cancelMock: MockLink.MockedResponse = {
        request: {
          query: CANCEL_SUBSCRIPTION,
          variables: { id: '1' },
        },
        result: {
          data: { cancelSubscription: { id: '1', isActive: false } },
        },
      };
      const refetchActive: MockLink.MockedResponse = {
        request: {
          query: GET_SUBSCRIPTIONS,
          variables: { page: 1, active: true },
        },
        result: {
          data: {
            subscriptions: {
              items: [mockYearlySubscription],
              totalCount: 1,
            },
          },
        },
      };
      const refetchInactive: MockLink.MockedResponse = {
        request: {
          query: GET_SUBSCRIPTIONS,
          variables: { page: 1, active: false },
        },
        result: {
          data: {
            subscriptions: { items: [], totalCount: 0 },
          },
        },
      };

      renderSubscriptions([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        cancelMock,
        refetchActive,
        refetchInactive,
      ]);
      await screen.findByText('Netflix');

      const optionButtons = screen.getAllByRole('button', { name: 'Options' });
      await userEvent.click(optionButtons[0]);
      await userEvent.click(screen.getByText('Cancel'));

      await userEvent.click(
        screen.getByRole('button', { name: 'Cancel Subscription' })
      );

      await waitFor(() => {
        expect(
          screen.queryByText('Cancel Subscription')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('delete subscription modal', () => {
    it('opens delete modal from dropdown menu', async () => {
      renderSubscriptions([mockActiveQuery, mockInactiveQueryEmpty]);
      await screen.findByText('Netflix');

      const optionButtons = screen.getAllByRole('button', { name: 'Options' });
      await userEvent.click(optionButtons[0]);
      await userEvent.click(screen.getByText('Delete'));

      expect(screen.getByText('Delete Subscription')).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete/)
      ).toBeInTheDocument();
    });

    it('deletes subscription on confirm and closes modal', async () => {
      const deleteMock: MockLink.MockedResponse = {
        request: {
          query: DELETE_SUBSCRIPTION,
          variables: { id: '1' },
        },
        result: { data: { deleteSubscription: true } },
      };
      const refetchActive: MockLink.MockedResponse = {
        request: {
          query: GET_SUBSCRIPTIONS,
          variables: { page: 1, active: true },
        },
        result: {
          data: {
            subscriptions: {
              items: [mockYearlySubscription],
              totalCount: 1,
            },
          },
        },
      };
      const refetchInactive: MockLink.MockedResponse = {
        request: {
          query: GET_SUBSCRIPTIONS,
          variables: { page: 1, active: false },
        },
        result: {
          data: {
            subscriptions: { items: [], totalCount: 0 },
          },
        },
      };

      renderSubscriptions([
        mockActiveQuery,
        mockInactiveQueryEmpty,
        deleteMock,
        refetchActive,
        refetchInactive,
      ]);
      await screen.findByText('Netflix');

      const optionButtons = screen.getAllByRole('button', { name: 'Options' });
      await userEvent.click(optionButtons[0]);
      await userEvent.click(screen.getByText('Delete'));

      await userEvent.click(screen.getByRole('button', { name: /^Delete$/ }));

      await waitFor(() => {
        expect(
          screen.queryByText('Delete Subscription')
        ).not.toBeInTheDocument();
      });
    });
  });
});
