import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../../test/fixtures/users';
import { requireSuperadmin } from './requireSuperadmin';

vi.mock('../../../lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
  },
}));

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
});

describe('requireSuperadmin', () => {
  it('returns the actor when the user is a superadmin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({
        supabaseId: 'admin-1',
        email: 'a@example.com',
        role: 'SUPERADMIN',
      })
    );

    const actor = await requireSuperadmin('admin-1');

    expect(actor).toMatchObject({ supabaseId: 'admin-1', role: 'SUPERADMIN' });
  });

  it('rejects a signed-in user without the role', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({ supabaseId: 'user-1', role: 'USER' })
    );

    await expect(requireSuperadmin('user-1')).rejects.toThrow(GraphQLError);
  });

  it('rejects a user that has no record at all', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(requireSuperadmin('ghost-1')).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' },
    });
  });
});
