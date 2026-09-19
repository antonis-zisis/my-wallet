import { OnboardingStep } from '../../types/onboarding';
import { Button, Card } from '../ui';
import { OnboardingStepRow } from './OnboardingStepRow';

type GettingStartedCardProps = {
  completedCount: number;
  onDismiss: () => void;
  steps: Array<OnboardingStep>;
  totalCount: number;
};

export function GettingStartedCard({
  completedCount,
  onDismiss,
  steps,
  totalCount,
}: GettingStartedCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-text-primary text-lg font-semibold">
            Getting started
          </h2>

          <p className="text-text-secondary text-sm">
            {completedCount} of {totalCount} done
          </p>
        </div>

        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Hide
        </Button>
      </div>

      <div
        aria-hidden="true"
        className="bg-bg-muted mt-3 h-1.5 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-brand-500 h-full transition-all duration-500"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      <ul className="divide-border mt-2 divide-y">
        {steps.map((step) => (
          <OnboardingStepRow key={step.id} step={step} />
        ))}
      </ul>
    </Card>
  );
}
