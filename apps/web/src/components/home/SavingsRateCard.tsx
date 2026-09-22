import { Card } from '../ui';

type SavingsRateCardProps = {
  className?: string;
  rate: number;
  reportTitle: string;
};

export function SavingsRateCard({
  className = '',
  rate,
  reportTitle,
}: SavingsRateCardProps) {
  const isSaved = rate >= 0;

  return (
    <Card className={className}>
      <p className="text-text-secondary text-sm">
        {isSaved ? 'Saved' : 'Overspent'}
      </p>

      <p
        className={`text-2xl font-bold ${
          isSaved
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {Math.abs(rate)}%
      </p>

      <p className="text-text-tertiary truncate text-xs">
        of income · {reportTitle}
      </p>
    </Card>
  );
}
