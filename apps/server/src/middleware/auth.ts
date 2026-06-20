import { createClient } from '@supabase/supabase-js';
import type { NextFunction, Request, Response } from 'express';

import { env } from '../lib/env';

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

export type AuthenticatedRequest = {
  userId?: string;
  email?: string;
} & Request;

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });

    return;
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' });

      return;
    }

    req.userId = data.user.id;
    req.email = data.user.email;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
