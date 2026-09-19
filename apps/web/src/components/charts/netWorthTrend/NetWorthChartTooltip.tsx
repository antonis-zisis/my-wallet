import { useMoneyFormatter } from '../../../hooks/useMoneyFormatter';
import { formatDate } from '../../../utils/formatDate';

type NetWorthTooltipPayloadEntry = {
  payload: {
    snapshotDate: string;
    id: string;
    netWorth: number;
    title: string;
  };
};

type NetWorthChartTooltipProps = {
  active?: boolean;
  payload?: Array<NetWorthTooltipPayloadEntry>;
};

export function NetWorthChartTooltip({
  active,
  payload,
}: NetWorthChartTooltipProps) {
  const formatAmount = useMoneyFormatter();

  if (!active || !payload?.length) {
    return null;
  }

  const { netWorth, snapshotDate, title } = payload[0].payload;
  const sign = netWorth < 0 ? '-' : '';

  return (
    <div className="bg-bg-surface ring-border rounded px-3 py-2 shadow-lg ring-1">
      <p className="text-text-primary text-xs font-semibold">{title}</p>

      <p className="text-text-secondary text-xs">{formatDate(snapshotDate)}</p>

      <p className="text-text-primary mt-1 text-xs font-semibold">
        {formatAmount(Math.abs(netWorth), { sign })}
      </p>
    </div>
  );
}
