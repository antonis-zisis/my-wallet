import { GraphQLError } from 'graphql';
import Stripe from 'stripe';

import { env } from './env';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new GraphQLError('Billing is not available right now', {
      extensions: { code: 'SERVICE_UNAVAILABLE' },
    });
  }

  return stripe;
}
