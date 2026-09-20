import { type Plan, PLAN_LABELS, PLAN_TAGLINES } from '../../types/plan';
import { Badge, Button, Card } from '../ui';

type PlanCardRow = {
  label: string;
  value: string;
};

type PlanCardProps = {
  ctaLabel: string;
  isCurrent: boolean;
  isRecommended?: boolean;
  isSelecting: boolean;
  onSelect: () => void;
  plan: Plan;
  rows: Array<PlanCardRow>;
};

export function PlanCard({
  ctaLabel,
  isCurrent,
  isRecommended = false,
  isSelecting,
  onSelect,
  plan,
  rows,
}: PlanCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-text-primary text-lg font-semibold">
          {PLAN_LABELS[plan]}
        </h2>

        {isRecommended && <Badge variant="info">Recommended</Badge>}

        {isCurrent && <Badge variant="success">Current plan</Badge>}
      </div>

      <p className="text-text-secondary mb-4 text-sm">{PLAN_TAGLINES[plan]}</p>

      <dl className="mb-6 flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="text-text-primary text-right font-medium">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Button
        className="mt-auto w-full"
        disabled={isCurrent}
        isLoading={isSelecting}
        variant={plan === 'PRO' ? 'primary' : 'secondary'}
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}
