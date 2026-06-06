import { describe, expect, it } from 'vitest';

import { dateToTitle } from './dateToTitle';

describe('dateToTitle', () => {
  it('formats a YYYY-MM-DD date as a long month + year title', () => {
    expect(dateToTitle('2026-01-15')).toBe('January 2026');
  });

  it('uses the month number, not a calendar offset', () => {
    expect(dateToTitle('2026-12-01')).toBe('December 2026');
  });
});
