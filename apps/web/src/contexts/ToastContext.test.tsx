import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast } from './ToastContext';

function TestConsumer() {
  const { dismiss, showError, showInfo, showSuccess, toasts } = useToast();
  return (
    <div>
      <button onClick={() => showSuccess('Saved!')}>Show success</button>
      <button onClick={() => showError('Failed!')}>Show error</button>
      <button onClick={() => showInfo('Note!')}>Show info</button>
      {toasts.map((toast) => (
        <div key={toast.id}>
          <span data-testid="toast-message">{toast.message}</span>
          <span data-testid="toast-variant">{toast.variant}</span>
          <button onClick={() => dismiss(toast.id)}>Dismiss {toast.id}</button>
        </div>
      ))}
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <TestConsumer />
    </ToastProvider>
  );
}

describe('ToastContext', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no toasts', () => {
    renderWithProvider();
    expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();
  });

  it('showSuccess adds a success toast', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show success'));
    expect(screen.getByTestId('toast-message')).toHaveTextContent('Saved!');
    expect(screen.getByTestId('toast-variant')).toHaveTextContent('success');
  });

  it('showError adds an error toast', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show error'));
    expect(screen.getByTestId('toast-message')).toHaveTextContent('Failed!');
    expect(screen.getByTestId('toast-variant')).toHaveTextContent('error');
  });

  it('showInfo adds an info toast', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show info'));
    expect(screen.getByTestId('toast-message')).toHaveTextContent('Note!');
    expect(screen.getByTestId('toast-variant')).toHaveTextContent('info');
  });

  it('multiple toasts can be shown at once', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show success'));
    fireEvent.click(screen.getByText('Show error'));
    expect(screen.getAllByTestId('toast-message')).toHaveLength(2);
  });

  it('dismiss removes the toast', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show success'));
    const dismissButton = screen.getByRole('button', { name: /^Dismiss/ });
    fireEvent.click(dismissButton);
    expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();
  });

  it('toast is automatically removed after 4 seconds', () => {
    vi.useFakeTimers();
    renderWithProvider();
    fireEvent.click(screen.getByText('Show success'));
    expect(screen.getByTestId('toast-message')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();
  });

  it('toast is still present before 4 seconds have elapsed', () => {
    vi.useFakeTimers();
    renderWithProvider();
    fireEvent.click(screen.getByText('Show success'));
    act(() => vi.advanceTimersByTime(3999));
    expect(screen.getByTestId('toast-message')).toBeInTheDocument();
  });

  it('throws when useToast is used outside ToastProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    consoleSpy.mockRestore();
  });
});
