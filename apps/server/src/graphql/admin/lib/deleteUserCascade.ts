import { GraphQLError } from 'graphql';

import prisma from '../../../lib/prisma';
import { supabaseAdmin } from '../../../lib/supabase';
import { SUPERADMIN_ROLE } from '../../../lib/validate/enums';
import type { AdminActor } from './requireSuperadmin';

type DeleteUserCascadeInput = {
  actor: AdminActor;
  confirmEmail: string;
  supabaseId: string;
};

export async function deleteUserCascade({
  actor,
  confirmEmail,
  supabaseId,
}: DeleteUserCascadeInput): Promise<boolean> {
  const target = await prisma.user.findUnique({
    where: { supabaseId },
    select: { supabaseId: true, email: true, role: true },
  });

  if (!target) {
    throw new GraphQLError('User not found', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  if (target.supabaseId === actor.supabaseId) {
    throw new GraphQLError('You cannot delete your own account', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  if (target.role === SUPERADMIN_ROLE) {
    throw new GraphQLError('Superadmin accounts cannot be deleted', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  if (confirmEmail !== target.email.trim().toLowerCase()) {
    throw new GraphQLError('Confirmation email does not match this user', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  await prisma.$transaction([
    prisma.adminAuditLog.create({
      data: {
        actorId: actor.supabaseId,
        actorEmail: actor.email,
        action: 'DELETE_USER',
        targetId: target.supabaseId,
        targetEmail: target.email,
      },
    }),
    prisma.user.delete({ where: { supabaseId } }),
  ]);

  const authError = await supabaseAdmin.auth.admin
    .deleteUser(supabaseId)
    .then(({ error }) => error)
    .catch((error: unknown) => error);

  if (authError) {
    throw new GraphQLError(
      'User data was deleted, but their auth account could not be removed. Remove it from the Supabase dashboard.',
      {
        extensions: {
          code: 'AUTH_DELETE_FAILED',
          reason: toReason(authError),
        },
      }
    );
  }

  return true;
}

function toReason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
