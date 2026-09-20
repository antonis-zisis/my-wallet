import prisma from '../prisma';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

type RecordStripeEventInput = {
  id: string;
  type: string;
};

export async function recordStripeEvent({
  id,
  type,
}: RecordStripeEventInput): Promise<boolean> {
  try {
    await prisma.stripeEvent.create({ data: { id, type } });

    return true;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === UNIQUE_CONSTRAINT_VIOLATION
    ) {
      return false;
    }

    throw error;
  }
}
