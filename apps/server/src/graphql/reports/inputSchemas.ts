import { z } from 'zod';

import { SHARE_ROLES } from '../../lib/validate';
import { boundedString, email, enumField } from '../../lib/validate/fields';

export const ReportInput = z.object({
  title: boundedString('Title', 255),
});

export type ReportInput = z.infer<typeof ReportInput>;

export const ShareReportInput = z.object({
  email,
  role: enumField(SHARE_ROLES, 'Role'),
});

export type ShareReportInput = z.infer<typeof ShareReportInput>;

export const UpdateReportShareRoleInput = z.object({
  role: enumField(SHARE_ROLES, 'Role'),
});

export type UpdateReportShareRoleInput = z.infer<
  typeof UpdateReportShareRoleInput
>;
