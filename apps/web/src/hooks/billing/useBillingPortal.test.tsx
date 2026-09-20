import { MockLink } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
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

import { CREATE_BILLING_PORTAL_SESSION } from '../../graphql/billing';
import { MockedProvider } from '../../test/apollo-test-utils';
import { useBillingPortal } from './useBillingPortal';

function renderBillingPortal(mocks: Array<MockLink.MockedResponse>) {
  return renderHook(() => useBillingPortal(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    ),
  });
}

beforeEach(() => {
  redirectTo.mockReset();
  showError.mockReset();
});

describe('useBillingPortal', () => {
  it('sends the user to the portal URL it is given', async () => {
    const { result } = renderBillingPortal([
      {
        request: { query: CREATE_BILLING_PORTAL_SESSION },
        result: {
          data: {
            createBillingPortalSession: { url: 'https://portal.stripe.test/s' },
          },
        },
      },
    ]);

    await act(async () => {
      await result.current.onManageBilling();
    });

    expect(redirectTo).toHaveBeenCalledWith('https://portal.stripe.test/s');
  });

  it('shows an error toast when the portal cannot be opened', async () => {
    const { result } = renderBillingPortal([
      {
        request: { query: CREATE_BILLING_PORTAL_SESSION },
        error: new Error('boom'),
      },
    ]);

    await act(async () => {
      await result.current.onManageBilling();
    });

    expect(redirectTo).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith(
      'Could not open the billing portal. Please try again.'
    );
    expect(result.current.isOpeningPortal).toBe(false);
  });
});
