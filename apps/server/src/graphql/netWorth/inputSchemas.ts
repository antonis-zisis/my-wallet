import { z } from 'zod';

import { NET_WORTH_ENTRY_TYPES } from '../../lib/validate';
import {
  amount,
  boundedString,
  date,
  enumField,
} from '../../lib/validate/fields';

const NetWorthEntryInput = z.object({
  type: enumField(NET_WORTH_ENTRY_TYPES, 'Entry type'),
  label: boundedString('Label', 255),
  amount,
  category: boundedString('Category', 100),
  notes: boundedString('Notes', 1000).nullish(),
});

export const NetWorthSnapshotInput = z.object({
  title: boundedString('Title', 255),
  snapshotDate: date,
  entries: z.array(NetWorthEntryInput),
});

export type NetWorthSnapshotInput = z.infer<typeof NetWorthSnapshotInput>;
