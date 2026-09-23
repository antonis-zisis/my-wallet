import { GraphQLError } from 'graphql';

import prisma from '../../../lib/prisma';
import { SUPERADMIN_ROLE } from '../../../lib/validate/enums';

export type AdminActor = {
  email: string;
  role: string;
  supabaseId: string;
};

export async function requireSuperadmin(userId: string): Promise<AdminActor> {
  const actor = await prisma.user.findUnique({
    where: { supabaseId: userId },
    select: { supabaseId: true, email: true, role: true },
  });

  if (actor?.role !== SUPERADMIN_ROLE) {
    throw new GraphQLError('You do not have access to this resource', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return actor;
}
