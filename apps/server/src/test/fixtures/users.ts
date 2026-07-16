import { User } from '../../generated/prisma/client';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-row-1',
    supabaseId: 'user-1',
    email: 'owner@example.com',
    fullName: 'Report Owner',
    lastSeenAt: null,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
  };
}
