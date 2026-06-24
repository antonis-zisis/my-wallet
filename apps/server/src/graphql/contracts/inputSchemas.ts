import { z } from 'zod';

import { amount, boundedString, date } from '../../lib/validate/fields';

const contractFields = {
  category: boundedString('Category', 255),
  provider: boundedString('Provider', 255),
  plan: boundedString('Plan', 255).nullish(),
  startDate: date.nullish(),
  endDate: date.nullish(),
  cost: amount.nullish(),
};

function endsOnOrAfterStart(data: {
  startDate?: Date | null;
  endDate?: Date | null;
}): boolean {
  if (!data.startDate || !data.endDate) {
    return true;
  }

  return data.endDate >= data.startDate;
}

const ORDER_ERROR = {
  error: 'End date must be on or after start date',
  path: ['endDate'],
};

export const CreateContractInput = z
  .object(contractFields)
  .refine(endsOnOrAfterStart, ORDER_ERROR);

export type CreateContractInput = z.infer<typeof CreateContractInput>;

export const UpdateContractInput = z
  .object({ id: boundedString('Id', 255), ...contractFields })
  .refine(endsOnOrAfterStart, ORDER_ERROR);

export type UpdateContractInput = z.infer<typeof UpdateContractInput>;
