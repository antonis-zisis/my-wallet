import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { userResolvers } from './resolvers';

const USER_ID = 'supabase-user-1';
const EMAIL = 'test@example.com';
const CTX = { userId: USER_ID, email: EMAIL };

const mockUser = {
  id: 'db-user-1',
  supabaseId: USER_ID,
  email: EMAIL,
  fullName: null,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

vi.mock('../../lib/prisma', () => ({
  default: {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

let prisma: typeof import('../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../lib/prisma')).default;
});

describe('userResolvers', () => {
  describe('Query.me', () => {
    it('upserts and returns the user', async () => {
      vi.mocked(prisma.user.upsert).mockResolvedValue(mockUser);

      const result = await userResolvers.Query.me(undefined, undefined, CTX);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { supabaseId: USER_ID },
        update: { email: EMAIL },
        create: { supabaseId: USER_ID, email: EMAIL },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('Mutation.updateMe', () => {
    it('updates the user fullName', async () => {
      const updatedUser = { ...mockUser, fullName: 'John Doe' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);

      const result = await userResolvers.Mutation.updateMe(
        undefined,
        { input: { fullName: 'John Doe' } },
        CTX
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { supabaseId: USER_ID },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { supabaseId: USER_ID },
        data: { fullName: 'John Doe' },
      });
      expect(result).toEqual(updatedUser);
    });

    it('throws NOT_FOUND if user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        userResolvers.Mutation.updateMe(
          undefined,
          { input: { fullName: 'John Doe' } },
          CTX
        )
      ).rejects.toThrow(GraphQLError);

      await expect(
        userResolvers.Mutation.updateMe(
          undefined,
          { input: { fullName: 'John Doe' } },
          CTX
        )
      ).rejects.toThrow('User not found');
    });
  });
});
