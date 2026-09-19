import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { buildOnboardingSteps } from '../../hooks/onboarding/selectors/buildOnboardingSteps';
import { makeOnboardingProgress } from '../../test/fixtures';
import { GettingStartedCard } from './GettingStartedCard';

function renderCard(steps = buildOnboardingSteps(makeOnboardingProgress())) {
  const onDismiss = vi.fn();
  const completedCount = steps.filter((step) => step.isDone).length;

  render(
    <MemoryRouter>
      <GettingStartedCard
        completedCount={completedCount}
        steps={steps}
        totalCount={steps.length}
        onDismiss={onDismiss}
      />
    </MemoryRouter>
  );

  return { onDismiss };
}

describe('GettingStartedCard', () => {
  it('shows how many steps are done', () => {
    renderCard(
      buildOnboardingSteps(
        makeOnboardingProgress({ hasSubscription: true, hasTransaction: true })
      )
    );

    expect(screen.getByText('2 of 4 done')).toBeInTheDocument();
  });

  it('links an unfinished step to its create flow', () => {
    renderCard();

    expect(
      screen.getByRole('link', { name: /Add a subscription/ })
    ).toHaveAttribute('href', '/subscriptions?new=1');
  });

  it('drops the action link once a step is done', () => {
    renderCard(
      buildOnboardingSteps(makeOnboardingProgress({ hasContract: true }))
    );

    expect(
      screen.queryByRole('link', { name: /Add a contract/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Add a contract')).toBeInTheDocument();
  });

  it('hides the checklist when the user asks it to', async () => {
    const { onDismiss } = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Hide' }));

    expect(onDismiss).toHaveBeenCalled();
  });
});
