import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Content</div>;
}

// suppress console.error for expected error boundary output
const consoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders full fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders compact fallback when compact prop is set', () => {
    render(
      <ErrorBoundary compact>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText('Failed to load this section.')
    ).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('resets and renders children again after clicking Try again', async () => {
    const user = userEvent.setup();

    let shouldThrow = true;

    function ToggleBomb() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Content</div>;
    }

    render(
      <ErrorBoundary>
        <ToggleBomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    consoleError.mockClear();
    await user.click(screen.getByText('Try again'));

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
