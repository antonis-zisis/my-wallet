import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOnboardingProgress } from './getOnboardingProgress';

vi.mock('../../../lib/prisma', () => ({
  default: {
    transaction: { findFirst: vi.fn() },
    subscription: { findFirst: vi.fn() },
    contract: { findFirst: vi.fn() },
    netWorthSnapshot: { findFirst: vi.fn() },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

const USER = { fullName: 'John Doe', supabaseId: 'user-1' };

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
  vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);
  vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
  vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);
  vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue(null);
});

describe('getOnboardingProgress', () => {
  it('reports nothing done for a brand new user', async () => {
    const progress = await getOnboardingProgress({
      fullName: null,
      supabaseId: 'user-1',
    });

    expect(progress).toEqual({
      hasContract: false,
      hasFullName: false,
      hasNetWorthSnapshot: false,
      hasSubscription: false,
      hasTransaction: false,
    });
  });

  it('reports every step done once the user has data everywhere', async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: 'transaction-1',
    } as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
      id: 'subscription-1',
    } as never);
    vi.mocked(prisma.contract.findFirst).mockResolvedValue({
      id: 'contract-1',
    } as never);
    vi.mocked(prisma.netWorthSnapshot.findFirst).mockResolvedValue({
      id: 'snapshot-1',
    } as never);

    const progress = await getOnboardingProgress(USER);

    expect(progress).toEqual({
      hasContract: true,
      hasFullName: true,
      hasNetWorthSnapshot: true,
      hasSubscription: true,
      hasTransaction: true,
    });
  });

  it('counts transactions on reports the user owns or created', async () => {
    await getOnboardingProgress(USER);

    expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ report: { userId: 'user-1' } }, { createdById: 'user-1' }],
      },
      select: { id: true },
    });
  });

  it('treats a blank name as no name', async () => {
    const progress = await getOnboardingProgress({
      fullName: '   ',
      supabaseId: 'user-1',
    });

    expect(progress.hasFullName).toBe(false);
  });
});
