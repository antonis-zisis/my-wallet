import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateMany = vi.hoisted(() => vi.fn());

vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'test-secret';
  process.env.PG_USER = 'user';
  process.env.PG_PASSWORD = 'password';
  process.env.PG_DATABASE = 'wallet';
});

vi.mock('./prisma', () => ({
  default: {
    user: {
      updateMany: mockUpdateMany,
    },
  },
}));

import { THROTTLE_MS, touchLastSeen } from './lastSeen';

describe('touchLastSeen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates lastSeenAt for the user, throttled to the window', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });

    touchLastSeen('supabase-user-123');

    await vi.waitFor(() => expect(mockUpdateMany).toHaveBeenCalledOnce());

    const { data, where } = mockUpdateMany.mock.calls[0][0];

    expect(where.supabaseId).toBe('supabase-user-123');
    expect(where.OR).toContainEqual({ lastSeenAt: null });
    expect(
      Date.now() - where.OR[1].lastSeenAt.lt.getTime()
    ).toBeGreaterThanOrEqual(THROTTLE_MS - 1000);
    expect(data.lastSeenAt).toBeInstanceOf(Date);
  });

  it('swallows database errors instead of failing the request', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockUpdateMany.mockRejectedValueOnce(new Error('connection refused'));

    touchLastSeen('supabase-user-123');

    await vi.waitFor(() => expect(warn).toHaveBeenCalledOnce());

    warn.mockRestore();
  });
});
