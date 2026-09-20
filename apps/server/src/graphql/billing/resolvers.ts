import { GraphQLError } from 'graphql';

import { env } from '../../lib/env';
import prisma from '../../lib/prisma';
import { requireStripe } from '../../lib/stripe';
import { parseInput } from '../../lib/validate';
import { CreateCheckoutSessionInput } from './inputSchemas';
import { getOrCreateStripeCustomer } from './lib/getOrCreateStripeCustomer';
import { getPlanPrices, priceIdFor } from './lib/getPlanPrices';

export const billingResolvers = {
  Query: {
    planPrices: () => getPlanPrices(),
  },

  Mutation: {
    createCheckoutSession: async (
      _parent: unknown,
      { input }: { input: unknown },
      { userId }: { userId: string }
    ) => {
      const data = parseInput(CreateCheckoutSessionInput, input);
      const priceId = priceIdFor(data.interval);

      if (!priceId) {
        throw new GraphQLError('Billing is not available right now', {
          extensions: { code: 'SERVICE_UNAVAILABLE' },
        });
      }

      const customer = await getOrCreateStripeCustomer(userId);

      const session = await requireStripe().checkout.sessions.create({
        mode: 'subscription',
        customer,
        client_reference_id: userId,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${env.APP_URL}/select-plan?checkout=success`,
        cancel_url: `${env.APP_URL}/select-plan?checkout=cancelled`,
      });

      if (!session.url) {
        throw new GraphQLError('Could not start checkout', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }

      return { url: session.url };
    },

    createBillingPortalSession: async (
      _parent: unknown,
      _args: unknown,
      { userId }: { userId: string }
    ) => {
      const user = await prisma.user.findUnique({
        where: { supabaseId: userId },
      });

      if (!user?.stripeCustomerId) {
        throw new GraphQLError('You do not have a billing account yet', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const session = await requireStripe().billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${env.APP_URL}/profile`,
      });

      return { url: session.url };
    },
  },
};
