import { type IntervalOption } from '../../hooks/billing/selectors/buildIntervalOptions';
import { type BillingInterval } from '../../types/billing';
import { Badge } from '../ui';

type PlanIntervalToggleProps = {
  options: Array<IntervalOption>;
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
};

export function PlanIntervalToggle({
  onChange,
  options,
  value,
}: PlanIntervalToggleProps) {
  if (options.length < 2) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Billing interval"
      className="border-border mx-auto flex w-full overflow-hidden rounded border sm:w-auto"
    >
      {options.map((option) => (
        <button
          key={option.interval}
          type="button"
          aria-pressed={option.interval === value}
          onClick={() => onChange(option.interval)}
          className={`border-border flex flex-1 cursor-pointer items-center justify-center gap-2 border-l px-4 py-2 text-sm font-medium transition-colors first:border-l-0 sm:flex-none ${
            option.interval === value
              ? 'bg-brand-600 text-white'
              : 'bg-bg-surface text-text-secondary hover:bg-bg-muted'
          }`}
        >
          {option.label}

          {option.savingsLabel && (
            <Badge
              size="sm"
              variant={option.interval === value ? 'default' : 'success'}
            >
              {option.savingsLabel}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
