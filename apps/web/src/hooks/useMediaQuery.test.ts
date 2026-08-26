import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { installMatchMedia } from '../test/matchMedia-test-utils';
import { useMediaQuery } from './useMediaQuery';

const QUERY = '(max-width: 500px)';

let matchMedia: ReturnType<typeof installMatchMedia>;

afterEach(() => {
  matchMedia?.restore();
});

describe('useMediaQuery', () => {
  it('returns false when the query does not match', () => {
    matchMedia = installMatchMedia([]);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });

  it('returns true when the query matches', () => {
    matchMedia = installMatchMedia([QUERY]);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(true);
  });

  it('re-renders with the new value when the query starts matching', () => {
    matchMedia = installMatchMedia([]);
    const { result } = renderHook(() => useMediaQuery(QUERY));

    act(() => matchMedia.setMatchingQueries([QUERY]));

    expect(result.current).toBe(true);
  });
});
