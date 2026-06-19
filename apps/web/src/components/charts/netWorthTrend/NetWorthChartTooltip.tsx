import { usePrivacy } from '../../../contexts/PrivacyContext';
import { formatDate } from '../../../utils/formatDate';
import { formatMoneyOrMask } from '../../../utils/formatMoney';

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
  const { isAmountsHidden } = usePrivacy();

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
        {sign}
        {formatMoneyOrMask(Math.abs(netWorth), isAmountsHidden)} €
      </p>
    </div>
  );
}
