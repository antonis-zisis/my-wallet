import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { COMPLETE_ONBOARDING } from '../../graphql/user';
import { MockedProvider } from '../../test/apollo-test-utils';
import { makeUser, onboardingResponse } from '../../test/fixtures';
import { useOnboardingData } from './useOnboardingData';

const updateUser = vi.fn();
const showError = vi.fn();

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    user: makeUser({ fullName: 'John Doe' }),
    loading: false,
    updateUser: (...args: Array<unknown>) => updateUser(...args),
  }),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showError: (...args: Array<unknown>) => showError(...args),
    showSuccess: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

const completeOnboarding = vi.fn();

function completeOnboardingResponse(): MockLink.MockedResponse {
  return {
    request: { query: COMPLETE_ONBOARDING },
    result: () => {
      completeOnboarding();

      return {
        data: {
          completeOnboarding: {
            id: 'user-1',
            onboardingCompletedAt: '2026-09-18T00:00:00.000Z',
          },
        },
      };
    },
  };
}

const EVERY_STEP_DONE = {
  hasContract: true,
  hasNetWorthSnapshot: true,
  hasSubscription: true,
  hasTransaction: true,
};

function renderOnboarding(mocks: Array<MockLink.MockedResponse>) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

  return renderHook(() => useOnboardingData(), { wrapper });
}

describe('useOnboardingData', () => {
  beforeEach(() => {
    localStorage.clear();
    updateUser.mockReset();
    showError.mockReset();
    completeOnboarding.mockReset();
  });

  it('hides the checklist while the query is loading', () => {
    const { result } = renderOnboarding([onboardingResponse()]);

    expect(result.current.isChecklistVisible).toBe(false);
    expect(result.current.steps).toEqual([]);
  });

  it('shows the checklist with the steps the user still has to do', async () => {
    const { result } = renderOnboarding([
      onboardingResponse({ progress: { hasTransaction: true } }),
    ]);

    await waitFor(() => {
      expect(result.current.isChecklistVisible).toBe(true);
    });
    expect(result.current.completedCount).toBe(1);
    expect(result.current.totalCount).toBe(4);
  });

  it('hides the checklist once onboarding has been completed', async () => {
    const { result } = renderOnboarding([
      onboardingResponse({ onboardingCompletedAt: '2026-09-01' }),
    ]);

    await waitFor(() => {
      expect(result.current.steps).toHaveLength(4);
    });
    expect(result.current.isChecklistVisible).toBe(false);
  });

  it('opens the welcome modal for a user with no progress at all', async () => {
    const { result } = renderOnboarding([onboardingResponse()]);

    await waitFor(() => {
      expect(result.current.isWelcomeOpen).toBe(true);
    });
  });

  it('keeps the welcome modal shut for a user who is already under way', async () => {
    const { result } = renderOnboarding([
      onboardingResponse({ progress: { hasSubscription: true } }),
    ]);

    await waitFor(() => {
      expect(result.current.isChecklistVisible).toBe(true);
    });
    expect(result.current.isWelcomeOpen).toBe(false);
  });

  it('does not reopen the welcome modal once it has been closed', async () => {
    const { result, unmount } = renderOnboarding([onboardingResponse()]);

    await waitFor(() => {
      expect(result.current.isWelcomeOpen).toBe(true);
    });
    act(() => result.current.onCloseWelcome());
    unmount();

    const second = renderOnboarding([onboardingResponse()]);

    await waitFor(() => {
      expect(second.result.current.isChecklistVisible).toBe(true);
    });
    expect(second.result.current.isWelcomeOpen).toBe(false);
  });

  it('saves the name and currency from the welcome modal', async () => {
    updateUser.mockResolvedValueOnce(undefined);
    const { result } = renderOnboarding([onboardingResponse()]);

    await waitFor(() => {
      expect(result.current.isWelcomeOpen).toBe(true);
    });
    await result.current.onSaveWelcome({
      currency: 'USD',
      fullName: '  Ada Lovelace  ',
    });

    expect(updateUser).toHaveBeenCalledWith({
      currency: 'USD',
      fullName: 'Ada Lovelace',
    });
  });

  it('shows an error toast when saving the welcome details fails', async () => {
    updateUser.mockRejectedValueOnce(new Error('nope'));
    const { result } = renderOnboarding([onboardingResponse()]);

    await waitFor(() => {
      expect(result.current.isWelcomeOpen).toBe(true);
    });
    await result.current.onSaveWelcome({ currency: 'EUR', fullName: 'Ada' });

    expect(showError).toHaveBeenCalledWith('Failed to save your details.');
  });

  it('completes onboarding on its own once every step is done', async () => {
    renderOnboarding([
      onboardingResponse({ progress: EVERY_STEP_DONE }),
      completeOnboardingResponse(),
    ]);

    await waitFor(() => {
      expect(completeOnboarding).toHaveBeenCalled();
    });
  });

  it('completes onboarding when the user hides the checklist', async () => {
    const { result } = renderOnboarding([
      onboardingResponse(),
      completeOnboardingResponse(),
    ]);

    await waitFor(() => {
      expect(result.current.isChecklistVisible).toBe(true);
    });
    await result.current.onDismiss();

    expect(completeOnboarding).toHaveBeenCalled();
  });
});
