import { describe, expect, it } from 'vitest';

import { makeEmptyEntryDraft, toEntryDraft } from './makeEntryDraft';

describe('makeEmptyEntryDraft', () => {
  it('defaults an ASSET draft to the first asset category', () => {
    const draft = makeEmptyEntryDraft(1, 'ASSET');

    expect(draft).toEqual({
      key: 1,
      type: 'ASSET',
      category: 'Savings',
      label: '',
      amount: '',
      notes: '',
    });
  });

  it('defaults a LIABILITY draft to the first liability category', () => {
    const draft = makeEmptyEntryDraft(2, 'LIABILITY');

    expect(draft.category).toBe('Mortgage');
    expect(draft.type).toBe('LIABILITY');
  });
});

describe('toEntryDraft', () => {
  it('serialises amount as a string and copies entry fields', () => {
    const draft = toEntryDraft(5, {
      type: 'ASSET',
      category: 'Investments',
      label: 'Stocks',
      amount: 1500,
      notes: 'Brokerage account',
    });

    expect(draft).toEqual({
      key: 5,
      type: 'ASSET',
      category: 'Investments',
      label: 'Stocks',
      amount: '1500',
      notes: 'Brokerage account',
    });
  });

  it('replaces missing notes with an empty string', () => {
    const draft = toEntryDraft(7, {
      type: 'LIABILITY',
      category: 'Car Loan',
      label: 'Car',
      amount: 200,
    });

    expect(draft.notes).toBe('');
  });
});
