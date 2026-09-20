import {
  BILLING_INTERVAL_LABELS,
  type BillingInterval,
  type PlanPrice,
} from '../../../types/billing';
import { formatPlanPrice } from '../../../utils/formatPlanPrice';

const INTERVAL_ORDER: Record<BillingInterval, number> = { MONTH: 0, YEAR: 1 };

export type IntervalOption = {
  interval: BillingInterval;
  label: string;
  priceLabel: string;
  savingsLabel: string | null;
};

function savingsLabelFor(
  yearly: PlanPrice,
  monthly: PlanPrice | undefined
): string | null {
  if (!monthly) {
    return null;
  }

  const fullYear = monthly.amount * 12;

  if (yearly.amount >= fullYear) {
    return null;
  }

  const percent = Math.round(((fullYear - yearly.amount) / fullYear) * 100);

  return percent > 0 ? `Save ${percent}%` : null;
}

export function buildIntervalOptions(
  prices: Array<PlanPrice>
): Array<IntervalOption> {
  const monthly = prices.find((price) => price.interval === 'MONTH');

  return prices
    .slice()
    .sort(
      (first, second) =>
        INTERVAL_ORDER[first.interval] - INTERVAL_ORDER[second.interval]
    )
    .map((price) => ({
      interval: price.interval,
      label: BILLING_INTERVAL_LABELS[price.interval],
      priceLabel: formatPlanPrice(price),
      savingsLabel:
        price.interval === 'YEAR' ? savingsLabelFor(price, monthly) : null,
    }));
}
