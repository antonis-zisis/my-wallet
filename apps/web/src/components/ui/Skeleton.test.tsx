import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a div', () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId('sk')).toBeInTheDocument();
  });

  it('applies animate-pulse class', () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId('sk')).toHaveClass('animate-pulse');
  });

  it('merges extra className', () => {
    render(<Skeleton data-testid="sk" className="h-4 w-1/2" />);
    const element = screen.getByTestId('sk');
    expect(element).toHaveClass('h-4');
    expect(element).toHaveClass('w-1/2');
  });
});
