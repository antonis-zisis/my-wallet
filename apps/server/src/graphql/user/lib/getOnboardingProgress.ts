import prisma from '../../../lib/prisma';

export type OnboardingProgress = {
  hasContract: boolean;
  hasFullName: boolean;
  hasNetWorthSnapshot: boolean;
  hasSubscription: boolean;
  hasTransaction: boolean;
};

type OnboardingProgressInput = {
  fullName: string | null;
  supabaseId: string;
};

export async function getOnboardingProgress({
  fullName,
  supabaseId,
}: OnboardingProgressInput): Promise<OnboardingProgress> {
  const [transaction, subscription, contract, snapshot] = await Promise.all([
    prisma.transaction.findFirst({
      where: {
        OR: [{ report: { userId: supabaseId } }, { createdById: supabaseId }],
      },
      select: { id: true },
    }),
    prisma.subscription.findFirst({
      where: { userId: supabaseId },
      select: { id: true },
    }),
    prisma.contract.findFirst({
      where: { userId: supabaseId },
      select: { id: true },
    }),
    prisma.netWorthSnapshot.findFirst({
      where: { userId: supabaseId },
      select: { id: true },
    }),
  ]);

  return {
    hasContract: !!contract,
    hasFullName: !!fullName?.trim(),
    hasNetWorthSnapshot: !!snapshot,
    hasSubscription: !!subscription,
    hasTransaction: !!transaction,
  };
}
