import {
  BILLING_PERIOD_LABELS,
  type BillingInterval,
  type PlanPrice,
} from '../types/billing';
import { type Currency, CURRENCY_CONFIG } from '../types/currency';

const FALLBACK_LOCALE = 'en-GB';

function localeFor(currency: string): string {
  return CURRENCY_CONFIG[currency as Currency]?.locale ?? FALLBACK_LOCALE;
}

export function formatPlanAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat(localeFor(currency), {
    currency,
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    style: 'currency',
  }).format(amount / 100);
}

export function formatPlanPrice({ amount, currency, interval }: PlanPrice) {
  return `${formatPlanAmount(amount, currency)} / ${periodLabel(interval)}`;
}

function periodLabel(interval: BillingInterval): string {
  return BILLING_PERIOD_LABELS[interval];
}
