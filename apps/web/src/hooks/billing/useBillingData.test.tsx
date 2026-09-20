import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { redirectTo, showError } = vi.hoisted(() => ({
  redirectTo: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('../../utils/redirectTo', () => ({ redirectTo }));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showError, showInfo: vi.fn(), showSuccess: vi.fn() }),
}));

import {
  CREATE_CHECKOUT_SESSION,
  GET_PLAN_PRICES,
} from '../../graphql/billing';
import { MockedProvider } from '../../test/apollo-test-utils';
import { useBillingData } from './useBillingData';

const pricesMock: MockLink.MockedResponse = {
  request: { query: GET_PLAN_PRICES },
  result: {
    data: {
      planPrices: [
        { amount: 400, currency: 'EUR', interval: 'MONTH' },
        { amount: 3840, currency: 'EUR', interval: 'YEAR' },
      ],
    },
  },
};

const emptyPricesMock: MockLink.MockedResponse = {
  request: { query: GET_PLAN_PRICES },
  result: { data: { planPrices: [] } },
};

function checkoutMock(url: string | null): MockLink.MockedResponse {
  return {
    request: {
      query: CREATE_CHECKOUT_SESSION,
      variables: { input: { interval: 'MONTH' } },
    },
    result: { data: { createCheckoutSession: url ? { url } : null } },
  };
}

function renderBillingData(mocks: Array<MockLink.MockedResponse>) {
  return renderHook(() => useBillingData(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    ),
  });
}

beforeEach(() => {
  redirectTo.mockReset();
  showError.mockReset();
});

describe('useBillingData', () => {
  it('offers no checkout until the prices arrive', () => {
    const { result } = renderBillingData([pricesMock]);

    expect(result.current.isCheckoutAvailable).toBe(false);
  });

  it('turns the prices into interval options', async () => {
    const { result } = renderBillingData([pricesMock]);

    await waitFor(() => expect(result.current.isCheckoutAvailable).toBe(true));

    expect(
      result.current.intervalOptions.map((option) => option.interval)
    ).toEqual(['MONTH', 'YEAR']);
  });

  it('stays unavailable when Stripe has no configured prices', async () => {
    const { result } = renderBillingData([emptyPricesMock]);

    await waitFor(() => expect(result.current.intervalOptions).toHaveLength(0));
    expect(result.current.isCheckoutAvailable).toBe(false);
  });

  it('sends the user to the checkout URL it is given', async () => {
    const { result } = renderBillingData([
      pricesMock,
      checkoutMock('https://checkout.stripe.test/s/1'),
    ]);

    await act(async () => {
      await result.current.onUpgrade('MONTH');
    });

    expect(redirectTo).toHaveBeenCalledWith('https://checkout.stripe.test/s/1');
    expect(showError).not.toHaveBeenCalled();
  });

  it('shows an error toast when checkout cannot be started', async () => {
    const { result } = renderBillingData([
      pricesMock,
      {
        request: {
          query: CREATE_CHECKOUT_SESSION,
          variables: { input: { interval: 'MONTH' } },
        },
        error: new Error('boom'),
      },
    ]);

    await act(async () => {
      await result.current.onUpgrade('MONTH');
    });

    expect(redirectTo).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith(
      'Could not start checkout. Please try again.'
    );
    expect(result.current.isStartingCheckout).toBe(false);
  });

  it('does not navigate when the session comes back without a URL', async () => {
    const { result } = renderBillingData([pricesMock, checkoutMock(null)]);

    await act(async () => {
      await result.current.onUpgrade('MONTH');
    });

    expect(redirectTo).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalled();
  });
});
