import { describe, expect, it } from 'vitest';

import { abbreviateReportTitle } from './abbreviateReportTitle';

describe('abbreviateReportTitle', () => {
  it('abbreviates a full month name and year', () => {
    expect(abbreviateReportTitle('March 2025')).toBe("Mar '25");
  });

  it('handles all twelve months', () => {
    const cases: Array<[string, string]> = [
      ['January 2025', "Jan '25"],
      ['February 2025', "Feb '25"],
      ['March 2025', "Mar '25"],
      ['April 2025', "Apr '25"],
      ['May 2025', "May '25"],
      ['June 2025', "Jun '25"],
      ['July 2025', "Jul '25"],
      ['August 2025', "Aug '25"],
      ['September 2025', "Sep '25"],
      ['October 2025', "Oct '25"],
      ['November 2025', "Nov '25"],
      ['December 2025', "Dec '25"],
    ];

    for (const [input, expected] of cases) {
      expect(abbreviateReportTitle(input)).toBe(expected);
    }
  });

  it('falls back to truncation for non-matching titles under 14 chars', () => {
    expect(abbreviateReportTitle('Q1 2025')).toBe('Q1 2025');
  });

  it('falls back to truncation for non-matching titles over 14 chars', () => {
    expect(abbreviateReportTitle('Custom Report Title')).toBe(
      'Custom Report …'
    );
  });
});
