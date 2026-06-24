import { describe, expect, it } from 'vitest';

import {
  type ContractFormValues,
  DEFAULT_CONTRACT_FORM_VALUES,
} from '../useContractForm';
import {
  buildContractInput,
  isContractFormValid,
  resolveCategory,
} from './buildContractInput';

function makeValues(
  overrides: Partial<ContractFormValues> = {}
): ContractFormValues {
  return { ...DEFAULT_CONTRACT_FORM_VALUES, ...overrides };
}

describe('resolveCategory', () => {
  it('returns the selected category when it is not "Other"', () => {
    const result = resolveCategory(makeValues({ category: 'Internet' }));

    expect(result).toBe('Internet');
  });

  it('returns the trimmed custom category when "Other" is selected', () => {
    const result = resolveCategory(
      makeValues({ category: 'Other', customCategory: '  Gym  ' })
    );

    expect(result).toBe('Gym');
  });

  it('falls back to "Other" when the custom category is whitespace only', () => {
    const result = resolveCategory(
      makeValues({ category: 'Other', customCategory: '   ' })
    );

    expect(result).toBe('Other');
  });
});

describe('buildContractInput', () => {
  it('trims the provider and parses the cost', () => {
    const result = buildContractInput(
      makeValues({
        provider: '  Vodafone  ',
        category: 'Internet',
        cost: '29.99',
      })
    );

    expect(result.provider).toBe('Vodafone');
    expect(result.cost).toBe(29.99);
  });

  it('coerces empty optional fields to undefined', () => {
    const result = buildContractInput(
      makeValues({ provider: 'Vodafone', category: 'Internet' })
    );

    expect(result.plan).toBeUndefined();
    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
    expect(result.cost).toBeUndefined();
  });
});

describe('isContractFormValid', () => {
  it('is valid for a provider and category with ordered dates', () => {
    const result = isContractFormValid(
      makeValues({
        provider: 'Vodafone',
        category: 'Internet',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
    );

    expect(result).toBe(true);
  });

  it('is invalid when the provider is empty', () => {
    const result = isContractFormValid(
      makeValues({ provider: '   ', category: 'Internet' })
    );

    expect(result).toBe(false);
  });

  it('is invalid when "Other" is selected without a custom category', () => {
    const result = isContractFormValid(
      makeValues({
        provider: 'Vodafone',
        category: 'Other',
        customCategory: '',
      })
    );

    expect(result).toBe(false);
  });

  it('is invalid when the end date precedes the start date', () => {
    const result = isContractFormValid(
      makeValues({
        provider: 'Vodafone',
        category: 'Internet',
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      })
    );

    expect(result).toBe(false);
  });
});
