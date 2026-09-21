import prisma from '../prisma';

export const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type UserCounts = {
  activeUsers: number;
  registeredUsers: number;
};

export function countActiveUsersSince(since: Date): Promise<number> {
  return prisma.user.count({ where: { lastSeenAt: { gte: since } } });
}

export function countRegisteredUsers(): Promise<number> {
  return prisma.user.count();
}

export async function countUsers(now = new Date()): Promise<UserCounts> {
  const [activeUsers, registeredUsers] = await Promise.all([
    countActiveUsersSince(new Date(now.getTime() - ACTIVE_WINDOW_MS)),
    countRegisteredUsers(),
  ]);

  return { activeUsers, registeredUsers };
}
