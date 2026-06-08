import { describe, expect, it } from 'vitest';

import { makeNetWorthEntry } from '../test/fixtures';
import { groupEntriesByCategory } from './groupEntriesByCategory';

describe('groupEntriesByCategory', () => {
  it('returns an empty array when given no entries', () => {
    const result = groupEntriesByCategory([]);

    expect(result).toEqual([]);
  });

  it('groups entries by their category', () => {
    const entries = [
      makeNetWorthEntry({ id: '1', label: 'Checking', category: 'Cash' }),
      makeNetWorthEntry({ id: '2', label: 'VTI', category: 'Investments' }),
      makeNetWorthEntry({ id: '3', label: 'Savings', category: 'Cash' }),
    ];

    const result = groupEntriesByCategory(entries);

    expect(result.map(([category]) => category)).toEqual([
      'Cash',
      'Investments',
    ]);
    expect(result[0][1].map((entry) => entry.id)).toEqual(['1', '3']);
  });

  it('sorts categories alphabetically', () => {
    const entries = [
      makeNetWorthEntry({ id: '1', category: 'Zebra' }),
      makeNetWorthEntry({ id: '2', category: 'Apple' }),
      makeNetWorthEntry({ id: '3', category: 'Mango' }),
    ];

    const result = groupEntriesByCategory(entries);

    expect(result.map(([category]) => category)).toEqual([
      'Apple',
      'Mango',
      'Zebra',
    ]);
  });

  it('sorts entries within a category alphabetically by label', () => {
    const entries = [
      makeNetWorthEntry({ id: '1', label: 'Zelda', category: 'Cash' }),
      makeNetWorthEntry({ id: '2', label: 'Apple', category: 'Cash' }),
      makeNetWorthEntry({ id: '3', label: 'Mango', category: 'Cash' }),
    ];

    const result = groupEntriesByCategory(entries);

    expect(result[0][1].map((entry) => entry.label)).toEqual([
      'Apple',
      'Mango',
      'Zelda',
    ]);
  });
});
