import { createHash, timingSafeEqual } from 'node:crypto';

import type { Request, Response } from 'express';

import { env } from '../lib/env';
import prisma from '../lib/prisma';

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

// active_users = users who made an authenticated request in the last 24 hours
// registered_users = all rows in the users table
export async function statsHandler(req: Request, res: Response) {
  if (!isAuthorized(req.headers.authorization)) {
    res.status(401).json({ error: 'Unauthorized' });

    return;
  }

  try {
    const [activeUsers, registeredUsers] = await Promise.all([
      prisma.user.count({
        where: { lastSeenAt: { gte: new Date(Date.now() - ACTIVE_WINDOW_MS) } },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      active_users: activeUsers,
      registered_users: registeredUsers,
    });
  } catch {
    res.status(503).json({ error: 'Stats unavailable' });
  }
}

function isAuthorized(authHeader: string | undefined): boolean {
  if (!env.STATS_TOKEN || !authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const digest = (value: string) => createHash('sha256').update(value).digest();

  return timingSafeEqual(digest(authHeader.slice(7)), digest(env.STATS_TOKEN));
}
