import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollToTopButton } from './ScrollToTopButton';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value });
  fireEvent.scroll(window);
}

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    setScrollY(0);
  });

  it('is hidden when the page has not scrolled past the threshold', () => {
    render(<ScrollToTopButton />);

    expect(
      screen.queryByRole('button', { name: 'Scroll to top' })
    ).not.toBeInTheDocument();
  });

  it('appears once the page scrolls past the threshold', () => {
    render(<ScrollToTopButton />);

    setScrollY(500);

    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument();
  });

  it('scrolls to the top when clicked', () => {
    window.scrollTo = vi.fn();
    render(<ScrollToTopButton />);
    setScrollY(500);

    fireEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
