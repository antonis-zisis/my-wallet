import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACTIVE_WINDOW_MS, countUsers } from './countUsers';

vi.mock('../prisma', () => ({
  default: { user: { count: vi.fn() } },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

describe('countUsers', () => {
  it('returns the active and registered totals', async () => {
    vi.mocked(prisma.user.count)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(9);

    const result = await countUsers();

    expect(result).toEqual({ activeUsers: 2, registeredUsers: 9 });
  });

  it('counts an active user as one seen inside the window', async () => {
    vi.mocked(prisma.user.count).mockResolvedValue(0);
    const now = new Date('2026-09-21T12:00:00Z');

    await countUsers(now);

    expect(prisma.user.count).toHaveBeenCalledWith({
      where: {
        lastSeenAt: { gte: new Date(now.getTime() - ACTIVE_WINDOW_MS) },
      },
    });
  });
});
