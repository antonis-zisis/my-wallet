import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockQueryRaw = vi.hoisted(() => vi.fn());

vi.mock('../lib/prisma', () => ({
  default: {
    $queryRaw: mockQueryRaw,
  },
}));

import { healthHandler } from './health';

function createMocks() {
  const req = {} as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe('healthHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 when the database responds', async () => {
    mockQueryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

    const { req, res } = createMocks();

    await healthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });

  it('returns 503 when the database query fails', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('connection refused'));

    const { req, res } = createMocks();

    await healthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ status: 'unavailable' });
  });
});
