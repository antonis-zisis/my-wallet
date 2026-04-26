import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ToastProvider, useToast } from '../../contexts/ToastContext';
import { ToastContainer } from './Toast';

function ToastTrigger() {
  const { showError, showInfo, showSuccess } = useToast();
  return (
    <>
      <button onClick={() => showSuccess('Saved!')}>Show success</button>
      <button onClick={() => showError('Failed!')}>Show error</button>
      <button onClick={() => showInfo('Note!')}>Show info</button>
    </>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <ToastContainer />
    </ToastProvider>
  );
}

function renderWithTriggers() {
  return render(
    <ToastProvider>
      <ToastTrigger />
      <ToastContainer />
    </ToastProvider>
  );
}

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = renderWithProvider();
    expect(container.firstChild).toBeNull();
  });

  it('renders a toast message', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show success'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show success'));
    fireEvent.click(screen.getByText('Show error'));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('dismiss button removes the toast', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show success'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss notification' })
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('applies success variant styles', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show success'));
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });

  it('applies error variant styles', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show error'));
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('applies info variant styles', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show info'));
    expect(screen.getByRole('alert')).toHaveClass('bg-brand-50');
  });

  it('has aria-live region for accessibility', () => {
    renderWithTriggers();
    fireEvent.click(screen.getByText('Show success'));
    const toastContainer = screen.getByRole('alert').parentElement;
    expect(toastContainer).toHaveAttribute('aria-live', 'polite');
  });
});
