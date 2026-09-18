import { useMoneyFormatter } from '../../../hooks/useMoneyFormatter';
import { formatDate } from '../../../utils/formatDate';

type BreakdownTooltipPayloadEntry = {
  payload: {
    snapshotDate: string;
    id: string;
    totalAssets: number;
    totalLiabilities: number;
    title: string;
  };
};

type BreakdownChartTooltipProps = {
  active?: boolean;
  payload?: Array<BreakdownTooltipPayloadEntry>;
};

export function BreakdownChartTooltip({
  active,
  payload,
}: BreakdownChartTooltipProps) {
  const formatAmount = useMoneyFormatter();

  if (!active || !payload?.length) {
    return null;
  }

  const { snapshotDate, title, totalAssets, totalLiabilities } =
    payload[0].payload;

  return (
    <div className="bg-bg-surface ring-border rounded px-3 py-2 shadow-lg ring-1">
      <p className="text-text-primary text-xs font-semibold">{title}</p>

      <p className="text-text-secondary text-xs">{formatDate(snapshotDate)}</p>

      <div className="mt-1 space-y-0.5">
        <p className="text-text-secondary flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Assets:{' '}
          <span className="font-semibold">{formatAmount(totalAssets)}</span>
        </p>

        <p className="text-text-secondary flex items-center gap-1.5 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Liabilities:{' '}
          <span className="font-semibold">
            {formatAmount(totalLiabilities)}
          </span>
        </p>
      </div>
    </div>
  );
}
