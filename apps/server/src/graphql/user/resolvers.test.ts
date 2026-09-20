import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures/users';
import { userResolvers } from './resolvers';

const envFlags = vi.hoisted(() => ({ ENABLE_SELF_SERVE_PLAN_SWITCH: true }));

vi.mock('../../lib/env', () => ({ env: envFlags }));

const USER_ID = 'supabase-user-1';
const EMAIL = 'test@example.com';
const CTX = { userId: USER_ID, email: EMAIL };

const mockUser = makeUser({
  id: 'db-user-1',
  supabaseId: USER_ID,
  email: EMAIL,
  fullName: null,
});

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
  envFlags.ENABLE_SELF_SERVE_PLAN_SWITCH = true;
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

    it('updates the user currency without touching the name', async () => {
      const updatedUser = { ...mockUser, currency: 'USD' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);

      const result = await userResolvers.Mutation.updateMe(
        undefined,
        { input: { currency: 'USD' } },
        CTX
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { supabaseId: USER_ID },
        data: { currency: 'USD' },
      });
      expect(result).toEqual(updatedUser);
    });

    it('rejects a currency outside the supported list', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      await expect(
        userResolvers.Mutation.updateMe(
          undefined,
          { input: { currency: 'XYZ' } },
          CTX
        )
      ).rejects.toThrow('Currency must be one of');

      expect(prisma.user.update).not.toHaveBeenCalled();
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

  describe('Query.plans', () => {
    it('returns every plan with its entitlements', () => {
      const result = userResolvers.Query.plans();

      expect(result.map((option) => option.plan)).toEqual(['FREE', 'PRO']);
      expect(result[0].entitlements.maxNetWorthSnapshots).toBe(1);
      expect(result[1].entitlements.maxNetWorthSnapshots).toBeNull();
    });
  });

  describe('User.entitlements', () => {
    it('resolves Free entitlements for a user who has not picked a plan', () => {
      const entitlements = userResolvers.User.entitlements(
        makeUser({ plan: null })
      );

      expect(entitlements.maxReports).toBe(3);
      expect(entitlements.canShareReports).toBe(false);
    });

    it('resolves unlimited entitlements on Pro', () => {
      const entitlements = userResolvers.User.entitlements(
        makeUser({ plan: 'PRO' })
      );

      expect(entitlements.maxReports).toBeNull();
      expect(entitlements.canShareReports).toBe(true);
    });
  });

  describe('Mutation.selectPlan', () => {
    it('stores the chosen plan', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue(
        makeUser({ plan: 'FREE' })
      );

      const result = await userResolvers.Mutation.selectPlan(
        undefined,
        { input: { plan: 'FREE' } },
        CTX
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { supabaseId: USER_ID },
        data: { plan: 'FREE' },
      });
      expect(result.plan).toBe('FREE');
    });

    it('refuses Pro while the self-serve switch is off', async () => {
      envFlags.ENABLE_SELF_SERVE_PLAN_SWITCH = false;

      const mutation = userResolvers.Mutation.selectPlan(
        undefined,
        { input: { plan: 'PRO' } },
        CTX
      );

      await expect(mutation).rejects.toThrow('Pro is not available yet');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an unknown plan', async () => {
      const mutation = userResolvers.Mutation.selectPlan(
        undefined,
        { input: { plan: 'ENTERPRISE' } },
        CTX
      );

      await expect(mutation).rejects.toThrow(/Plan must be one of/);
    });
  });

  describe('Mutation.completeOnboarding', () => {
    it('stamps the completion time on the user', async () => {
      const completedUser = { ...mockUser, onboardingCompletedAt: new Date() };
      vi.mocked(prisma.user.update).mockResolvedValue(completedUser);

      const result = await userResolvers.Mutation.completeOnboarding(
        undefined,
        undefined,
        CTX
      );

      const { data, where } = vi.mocked(prisma.user.update).mock.calls[0][0];
      expect(where).toEqual({ supabaseId: USER_ID });
      expect(data.onboardingCompletedAt).toBeInstanceOf(Date);
      expect(result).toEqual(completedUser);
    });
  });

  describe('Mutation.resetOnboarding', () => {
    it('clears the completion time so onboarding shows again', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      await userResolvers.Mutation.resetOnboarding(undefined, undefined, CTX);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { supabaseId: USER_ID },
        data: { onboardingCompletedAt: null },
      });
    });
  });
});
