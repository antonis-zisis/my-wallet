import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  installMatchMedia,
  MOBILE_VIEWPORT_QUERY,
} from '../test/matchMedia-test-utils';
import { useIsMobileViewport } from './useIsMobileViewport';

let matchMedia: ReturnType<typeof installMatchMedia>;

afterEach(() => {
  matchMedia?.restore();
});

describe('useIsMobileViewport', () => {
  it('is true below the md breakpoint', () => {
    matchMedia = installMatchMedia([MOBILE_VIEWPORT_QUERY]);

    const { result } = renderHook(() => useIsMobileViewport());

    expect(result.current).toBe(true);
  });

  it('is false at or above the md breakpoint', () => {
    matchMedia = installMatchMedia([]);

    const { result } = renderHook(() => useIsMobileViewport());

    expect(result.current).toBe(false);
  });
});
