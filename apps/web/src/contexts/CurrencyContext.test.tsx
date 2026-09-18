import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../test/fixtures';
import { CurrencyProvider, useCurrency } from './CurrencyContext';

const useUser = vi.fn();

vi.mock('./UserContext', () => ({
  useUser: () => useUser(),
}));

function TestConsumer() {
  const { currency, symbol } = useCurrency();

  return (
    <div>
      <span data-testid="currency">{currency}</span>
      <span data-testid="symbol">{symbol}</span>
    </div>
  );
}

function renderConsumer() {
  return render(
    <CurrencyProvider>
      <TestConsumer />
    </CurrencyProvider>
  );
}

describe('CurrencyProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    useUser.mockReset();
    useUser.mockReturnValue({
      user: null,
      loading: false,
      updateUser: vi.fn(),
    });
  });

  it('renders children', () => {
    useUser.mockReturnValue({
      user: makeUser(),
      loading: false,
      updateUser: vi.fn(),
    });

    render(
      <CurrencyProvider>
        <p>Child content</p>
      </CurrencyProvider>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('surfaces the currency saved on the user', () => {
    useUser.mockReturnValue({
      user: makeUser({ currency: 'USD' }),
      loading: false,
      updateUser: vi.fn(),
    });

    renderConsumer();

    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
    expect(screen.getByTestId('symbol')).toHaveTextContent('$');
  });

  it('falls back to euro while the user is still loading', () => {
    renderConsumer();

    expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
    expect(screen.getByTestId('symbol')).toHaveTextContent('€');
  });

  it('reuses the last known currency before the user loads', () => {
    useUser.mockReturnValue({
      user: makeUser({ currency: 'GBP' }),
      loading: false,
      updateUser: vi.fn(),
    });
    const { unmount } = renderConsumer();
    unmount();

    useUser.mockReturnValue({ user: null, loading: true, updateUser: vi.fn() });
    renderConsumer();

    expect(screen.getByTestId('currency')).toHaveTextContent('GBP');
  });

  it('ignores a currency the app does not support', () => {
    useUser.mockReturnValue({
      user: makeUser({ currency: 'XYZ' }),
      loading: false,
      updateUser: vi.fn(),
    });

    renderConsumer();

    expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
  });
});
