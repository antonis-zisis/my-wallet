import { z } from 'zod';

import { boundedString, email } from '../../lib/validate/fields';

export const AdminDeleteUserInput = z.object({
  supabaseId: boundedString('User id', 255).min(1, 'User id is required'),
  confirmEmail: email,
});

export type AdminDeleteUserInput = z.infer<typeof AdminDeleteUserInput>;
