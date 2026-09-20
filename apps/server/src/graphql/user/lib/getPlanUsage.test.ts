import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlanUsage } from './getPlanUsage';

vi.mock('../../../lib/prisma', () => ({
  default: {
    subscription: { count: vi.fn() },
    contract: { count: vi.fn() },
    netWorthSnapshot: { count: vi.fn() },
    report: { count: vi.fn() },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('getPlanUsage', () => {
  it('counts what the caps apply to', async () => {
    vi.mocked(prisma.subscription.count).mockResolvedValue(4);
    vi.mocked(prisma.contract.count).mockResolvedValue(2);
    vi.mocked(prisma.netWorthSnapshot.count).mockResolvedValue(1);
    vi.mocked(prisma.report.count).mockResolvedValue(3);

    const usage = await getPlanUsage('user-1');

    expect(usage).toEqual({
      activeSubscriptions: 4,
      contracts: 2,
      netWorthSnapshots: 1,
      reports: 3,
    });
  });

  it('counts only subscriptions that are still active', async () => {
    vi.mocked(prisma.subscription.count).mockResolvedValue(0);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);
    vi.mocked(prisma.netWorthSnapshot.count).mockResolvedValue(0);
    vi.mocked(prisma.report.count).mockResolvedValue(0);

    await getPlanUsage('user-1');

    expect(prisma.subscription.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ userId: 'user-1', isActive: true }),
    });
  });
});
