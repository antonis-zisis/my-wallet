import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../../test/fixtures/users';
import { deleteUserCascade } from './deleteUserCascade';

const mockAuthDeleteUser = vi.hoisted(() => vi.fn());

vi.mock('../../../lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn(), delete: vi.fn() },
    adminAuditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../../lib/supabase', () => ({
  supabaseAdmin: { auth: { admin: { deleteUser: mockAuthDeleteUser } } },
}));

const ACTOR = {
  supabaseId: 'admin-1',
  email: 'admin@example.com',
  role: 'SUPERADMIN',
};

const TARGET = makeUser({
  supabaseId: 'user-2',
  email: 'victim@example.com',
  role: 'USER',
});

function runDelete(supabaseId: string, confirmEmail: string) {
  return deleteUserCascade({ actor: ACTOR, confirmEmail, supabaseId });
}

let prisma: typeof import('../../../lib/prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../../../lib/prisma')).default;
  mockAuthDeleteUser.mockResolvedValue({ error: null });
});

describe('deleteUserCascade', () => {
  it('deletes the user and removes their auth account', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(TARGET);

    const result = await runDelete('user-2', 'victim@example.com');

    expect(result).toBe(true);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { supabaseId: 'user-2' },
    });
    expect(mockAuthDeleteUser).toHaveBeenCalledWith('user-2');
  });

  it('records who deleted whom', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(TARGET);

    await runDelete('user-2', 'victim@example.com');

    expect(prisma.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 'admin-1',
        actorEmail: 'admin@example.com',
        action: 'DELETE_USER',
        targetId: 'user-2',
        targetEmail: 'victim@example.com',
      },
    });
  });

  it('reports a user that does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      runDelete('ghost-1', 'nobody@example.com')
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('refuses to delete the acting admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({
        supabaseId: 'admin-1',
        email: 'admin@example.com',
        role: 'SUPERADMIN',
      })
    );

    await expect(
      runDelete('admin-1', 'admin@example.com')
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });

  it('refuses to delete another superadmin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      makeUser({
        supabaseId: 'admin-2',
        email: 'other@example.com',
        role: 'SUPERADMIN',
      })
    );

    await expect(
      runDelete('admin-2', 'other@example.com')
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });

  it('refuses when the confirmation email does not match', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(TARGET);

    await expect(
      runDelete('user-2', 'wrong@example.com')
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('tells the admin to finish up in Supabase when the auth delete throws', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(TARGET);
    mockAuthDeleteUser.mockRejectedValue(new Error('not a uuid'));

    await expect(
      runDelete('user-2', 'victim@example.com')
    ).rejects.toMatchObject({ extensions: { code: 'AUTH_DELETE_FAILED' } });
  });

  it('tells the admin to finish up in Supabase when the auth delete fails', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(TARGET);
    mockAuthDeleteUser.mockResolvedValue({ error: { message: 'boom' } });

    await expect(
      runDelete('user-2', 'victim@example.com')
    ).rejects.toMatchObject({ extensions: { code: 'AUTH_DELETE_FAILED' } });
  });
});
