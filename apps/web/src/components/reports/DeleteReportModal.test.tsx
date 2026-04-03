import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteReportModal } from './DeleteReportModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  reportTitle: 'January Budget',
  isDeleting: false,
};

describe('DeleteReportModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <DeleteReportModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows report title in confirmation message', () => {
    render(<DeleteReportModal {...defaultProps} />);
    expect(screen.getByText('January Budget')).toBeInTheDocument();
    expect(
      screen.getByText(
        /All transactions in this report will be permanently deleted/
      )
    ).toBeInTheDocument();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteReportModal {...defaultProps} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteReportModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
