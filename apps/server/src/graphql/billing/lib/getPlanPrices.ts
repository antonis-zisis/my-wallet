import { env } from '../../../lib/env';
import { stripe } from '../../../lib/stripe';

export type PlanPrice = {
  amount: number;
  currency: string;
  interval: 'MONTH' | 'YEAR';
};

export function priceIdFor(interval: 'MONTH' | 'YEAR'): string | undefined {
  return interval === 'YEAR'
    ? env.STRIPE_PRICE_ID_YEARLY
    : env.STRIPE_PRICE_ID_MONTHLY;
}

export async function getPlanPrices(): Promise<Array<PlanPrice>> {
  const client = stripe;
  const intervals = ['MONTH', 'YEAR'] as const;
  const configured = intervals
    .map((interval) => ({ interval, priceId: priceIdFor(interval) }))
    .filter(
      (
        candidate
      ): candidate is { interval: 'MONTH' | 'YEAR'; priceId: string } =>
        !!candidate.priceId
    );

  if (!client || configured.length === 0) {
    return [];
  }

  const prices = await Promise.all(
    configured.map(async ({ interval, priceId }) => {
      const price = await client.prices.retrieve(priceId);

      return { interval, price };
    })
  );

  return prices
    .filter(({ price }) => price.unit_amount !== null)
    .map(({ interval, price }) => ({
      amount: price.unit_amount as number,
      currency: price.currency.toUpperCase(),
      interval,
    }));
}
