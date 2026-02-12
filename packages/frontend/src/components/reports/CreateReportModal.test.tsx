import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CreateReportModal } from './CreateReportModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('CreateReportModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <CreateReportModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal with title input when open', () => {
    render(<CreateReportModal {...defaultProps} />);
    expect(screen.getByText('Create Report')).toBeInTheDocument();
    expect(screen.getByLabelText('Report Title')).toBeInTheDocument();
  });

  it('disables Create button when title is empty', () => {
    render(<CreateReportModal {...defaultProps} />);
    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables Create button when title has content', async () => {
    render(<CreateReportModal {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Report Title'), 'My Report');
    expect(screen.getByText('Create')).toBeEnabled();
  });

  it('submits trimmed title', async () => {
    const onSubmit = vi.fn();
    render(<CreateReportModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByLabelText('Report Title'),
      '  My Report  '
    );
    await userEvent.click(screen.getByText('Create'));

    expect(onSubmit).toHaveBeenCalledWith('My Report');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CreateReportModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
