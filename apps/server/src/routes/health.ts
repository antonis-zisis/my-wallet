import type { Request, Response } from 'express';

import prisma from '../lib/prisma';

// unauthenticated health probe for uptime monitors
export async function healthHandler(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
}
