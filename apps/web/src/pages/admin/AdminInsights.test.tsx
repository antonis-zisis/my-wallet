import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { GET_ADMIN_INSIGHTS } from '../../graphql/admin';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makeAdminInsights } from '../../test/fixtures';
import { AdminInsights as AdminInsightsType } from '../../types/admin';
import { AdminInsights } from './AdminInsights';

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

const insightsMock = (
  insights: AdminInsightsType
): MockLink.MockedResponse => ({
  maxUsageCount: Number.POSITIVE_INFINITY,
  request: { query: GET_ADMIN_INSIGHTS },
  result: { data: { adminInsights: insights } },
});

const insightsErrorMock = (): MockLink.MockedResponse => ({
  request: { query: GET_ADMIN_INSIGHTS },
  error: new Error('boom'),
});

function renderPage(mocks: Array<MockLink.MockedResponse>) {
  return render(
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <AdminInsights />
      </ThemeProvider>
    </MockedProvider>
  );
}

describe('AdminInsights', () => {
  it('shows a skeleton while loading', () => {
    renderPage([insightsMock(makeAdminInsights())]);

    expect(screen.getByTestId('admin-insights-skeleton')).toBeInTheDocument();
  });

  it('shows an error message when the query fails', async () => {
    renderPage([insightsErrorMock()]);

    expect(
      await screen.findByText('Failed to load insights.')
    ).toBeInTheDocument();
  });

  it('shows the headline user counts', async () => {
    renderPage([
      insightsMock(
        makeAdminInsights({ registeredUsers: 42, activeUsers24h: 7 })
      ),
    ]);

    expect(await screen.findByText('Registered')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Active (24h)')).toBeInTheDocument();
  });

  it('shows each onboarding step with its share of users', async () => {
    renderPage([
      insightsMock(
        makeAdminInsights({
          onboardingFunnel: {
            completed: 0,
            total: 4,
            withContract: 0,
            withFullName: 4,
            withNetWorthSnapshot: 0,
            withSubscription: 0,
            withTransaction: 2,
          },
        })
      ),
    ]);

    expect(await screen.findByText('Added a transaction')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Added their name')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('explains an empty signup window instead of drawing a chart', async () => {
    renderPage([insightsMock(makeAdminInsights({ signupsByWeek: [] }))]);

    expect(
      await screen.findByText('No signups in this window.')
    ).toBeInTheDocument();
  });
});
