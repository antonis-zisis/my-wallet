import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCount = vi.hoisted(() => vi.fn());

vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'test-secret';
  process.env.PG_USER = 'user';
  process.env.PG_PASSWORD = 'password';
  process.env.PG_DATABASE = 'wallet';
  process.env.STATS_TOKEN = 'stats-token';
});

vi.mock('../lib/prisma', () => ({
  default: {
    user: {
      count: mockCount,
    },
  },
}));

import { statsHandler } from './stats';

function createMocks(authHeader?: string) {
  const req = {
    headers: { authorization: authHeader },
  } as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe('statsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns active and registered users with a valid token', async () => {
    mockCount.mockResolvedValueOnce(3).mockResolvedValueOnce(15);

    const { req, res } = createMocks('Bearer stats-token');

    await statsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      active_users: 3,
      registered_users: 15,
    });
  });

  it('counts active users seen within the last 24 hours', async () => {
    mockCount.mockResolvedValue(0);

    const { req, res } = createMocks('Bearer stats-token');

    await statsHandler(req, res);

    const { where } = mockCount.mock.calls[0][0];
    const elapsedMs = Date.now() - where.lastSeenAt.gte.getTime();

    expect(elapsedMs).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 1000);
    expect(elapsedMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000);
  });

  it('returns 401 when no Authorization header', async () => {
    const { req, res } = createMocks();

    await statsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockCount).not.toHaveBeenCalled();
  });

  it('returns 401 with a wrong token', async () => {
    const { req, res } = createMocks('Bearer wrong-token');

    await statsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockCount).not.toHaveBeenCalled();
  });

  it('returns 503 when the database query fails', async () => {
    mockCount.mockRejectedValue(new Error('connection refused'));

    const { req, res } = createMocks('Bearer stats-token');

    await statsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });
});
