import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { useOpenOnParam } from './useOpenOnParam';

function renderWithPath(path: string, onOpen: () => void) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  );

  return renderHook(() => useOpenOnParam(onOpen), { wrapper });
}

describe('useOpenOnParam', () => {
  it('opens when the param is present', () => {
    const onOpen = vi.fn();

    renderWithPath('/reports?new=1', onOpen);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('stays shut without the param', () => {
    const onOpen = vi.fn();

    renderWithPath('/reports', onOpen);

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('opens only once, so a re-render does not reopen it', () => {
    const onOpen = vi.fn();

    const { rerender } = renderWithPath('/reports?new=1', onOpen);
    rerender();

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
