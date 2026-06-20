import { z } from 'zod';

export const UpdateUserInput = z.object({
  fullName: z
    .string()
    .trim()
    .max(255, 'Full name must be 255 characters or fewer')
    .nullish(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInput>;
