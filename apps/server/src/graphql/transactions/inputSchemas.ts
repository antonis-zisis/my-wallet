import { z } from 'zod';

import { TRANSACTION_TYPES } from '../../lib/validate';
import {
  amount,
  boundedString,
  date,
  enumField,
} from '../../lib/validate/fields';

export const TransactionInput = z.object({
  type: enumField(TRANSACTION_TYPES, 'Type'),
  amount,
  description: boundedString('Description', 1000),
  category: boundedString('Category', 100),
  date,
});

export type TransactionInput = z.infer<typeof TransactionInput>;
