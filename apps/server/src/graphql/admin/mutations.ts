import { parseInput } from '../../lib/validate';
import { AdminDeleteUserInput } from './inputSchemas';
import { deleteUserCascade } from './lib/deleteUserCascade';
import { requireSuperadmin } from './lib/requireSuperadmin';

export const adminMutationResolvers = {
  adminDeleteUser: async (
    _parent: unknown,
    { input }: { input: unknown },
    { userId }: { userId: string }
  ) => {
    const actor = await requireSuperadmin(userId);
    const data = parseInput(AdminDeleteUserInput, input);

    return deleteUserCascade({
      actor,
      confirmEmail: data.confirmEmail,
      supabaseId: data.supabaseId,
    });
  },
};
