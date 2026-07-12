import prisma from './prisma';

export const THROTTLE_MS = 15 * 60 * 1000;

// fire-and-forget "user made a request" marker, throttled so authenticated traffic costs at most one users write per throttle window
export function touchLastSeen(supabaseId: string): void {
  const cutoff = new Date(Date.now() - THROTTLE_MS);

  prisma.user
    .updateMany({
      where: {
        supabaseId,
        OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: cutoff } }],
      },
      data: { lastSeenAt: new Date() },
    })
    .catch((error: unknown) => {
      console.warn('Failed to update last_seen_at:', error);
    });
}
