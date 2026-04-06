import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteNetWorthSnapshotModal } from './DeleteNetWorthSnapshotModal';

const defaultProps = {
  isOpen: true,
  isDeleting: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  snapshotTitle: 'January 2026',
};

describe('DeleteNetWorthSnapshotModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <DeleteNetWorthSnapshotModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal title and snapshot name when open', () => {
    render(<DeleteNetWorthSnapshotModal {...defaultProps} />);
    expect(screen.getByText('Delete Snapshot')).toBeInTheDocument();
    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteNetWorthSnapshotModal {...defaultProps} onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteNetWorthSnapshotModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state on Delete button when isDeleting is true', () => {
    render(<DeleteNetWorthSnapshotModal {...defaultProps} isDeleting />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
