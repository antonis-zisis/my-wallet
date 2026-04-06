import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CreateReportModal } from './CreateReportModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
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

  it('disables Create button when title is less than 3 characters', async () => {
    render(<CreateReportModal {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Report Title'), 'ab');
    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('shows static hint about character limits', () => {
    render(<CreateReportModal {...defaultProps} />);
    expect(screen.getByText('Between 3–100 characters')).toBeInTheDocument();
  });

  it('enables Create button when title meets minimum length', async () => {
    render(<CreateReportModal {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Report Title'), 'My Report');
    expect(screen.getByText('Create')).toBeEnabled();
  });

  it('shows character counter', async () => {
    render(<CreateReportModal {...defaultProps} />);
    expect(screen.getByText('0/100')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Report Title'), 'My Report');
    expect(screen.getByText('9/100')).toBeInTheDocument();
  });

  it('submits trimmed title on button click', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateReportModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByLabelText('Report Title'),
      '  My Report  '
    );
    await userEvent.click(screen.getByText('Create'));

    expect(onSubmit).toHaveBeenCalledWith('My Report');
  });

  it('submits trimmed title on Enter key', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateReportModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Report Title'), 'My Report');
    await userEvent.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('My Report');
  });

  it('does not submit on Enter when title is invalid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateReportModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Report Title'), 'ab');
    await userEvent.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps modal open when submit fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<CreateReportModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Report Title'), 'My Report');
    await userEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByLabelText('Report Title')).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CreateReportModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
