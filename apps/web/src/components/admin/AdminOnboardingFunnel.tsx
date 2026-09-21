import { AdminOnboardingFunnel as Funnel } from '../../types/admin';
import { Card } from '../ui';

type AdminOnboardingFunnelProps = {
  funnel: Funnel;
};

type FunnelStep = {
  label: string;
  value: number;
};

function StepRow({ step, total }: { step: FunnelStep; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((step.value / total) * 100);

  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-text-secondary text-sm">{step.label}</span>
        <span className="text-text-primary text-sm font-medium">
          {step.value}
          <span className="text-text-tertiary ml-1.5 text-xs">
            {percentage}%
          </span>
        </span>
      </div>

      <div className="bg-bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-brand-500 h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </li>
  );
}

export function AdminOnboardingFunnel({ funnel }: AdminOnboardingFunnelProps) {
  const steps: Array<FunnelStep> = [
    { label: 'Added their name', value: funnel.withFullName },
    { label: 'Added a transaction', value: funnel.withTransaction },
    { label: 'Added a subscription', value: funnel.withSubscription },
    { label: 'Added a contract', value: funnel.withContract },
    { label: 'Added a net worth snapshot', value: funnel.withNetWorthSnapshot },
    { label: 'Finished onboarding', value: funnel.completed },
  ];

  return (
    <Card>
      <div className="p-1">
        <h2 className="text-text-primary text-sm font-semibold">
          Onboarding &amp; adoption
        </h2>
        <p className="text-text-secondary mt-0.5 mb-4 text-xs">
          Share of all {funnel.total} registered users who have done each step.
        </p>

        <ul className="space-y-3">
          {steps.map((step) => (
            <StepRow key={step.label} step={step} total={funnel.total} />
          ))}
        </ul>
      </div>
    </Card>
  );
}
