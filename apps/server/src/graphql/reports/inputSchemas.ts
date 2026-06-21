import { z } from 'zod';

import { boundedString } from '../../lib/validate/fields';

export const ReportInput = z.object({
  title: boundedString('Title', 255),
});

export type ReportInput = z.infer<typeof ReportInput>;
