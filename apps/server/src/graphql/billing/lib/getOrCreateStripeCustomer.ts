import { GraphQLError } from 'graphql';

import prisma from '../../../lib/prisma';
import { requireStripe } from '../../../lib/stripe';

export async function getOrCreateStripeCustomer(
  userId: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { supabaseId: userId },
  });

  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await requireStripe().customers.create({
    email: user.email,
    metadata: { supabaseId: userId },
  });

  await prisma.user.update({
    where: { supabaseId: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
