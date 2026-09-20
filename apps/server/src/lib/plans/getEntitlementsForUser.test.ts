import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures/users';
import { entitlementsForPlan } from './entitlementsForPlan';
import { getEntitlementsForUser } from './getEntitlementsForUser';

vi.mock('../prisma', () => ({
  default: { user: { findUnique: vi.fn() } },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

describe('getEntitlementsForUser', () => {
  it('resolves the entitlements of the stored plan', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({ plan: 'PRO' })
    );

    const entitlements = await getEntitlementsForUser('user-1');

    expect(entitlements).toEqual(entitlementsForPlan('PRO'));
  });

  it('falls back to Free when the user row is missing', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const entitlements = await getEntitlementsForUser('user-1');

    expect(entitlements).toEqual(entitlementsForPlan('FREE'));
  });
});
