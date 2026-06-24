import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { WhatsNewModal } from './WhatsNewModal';

vi.mock('../content/whatsNew', () => ({
  whatsNew: [
    {
      version: '1.2.0',
      date: '2026-06-24',
      highlights: [
        {
          title: 'Brand new dashboard',
          description: 'See everything at once.',
        },
      ],
      improvements: [{ title: 'Faster reports' }],
    },
  ],
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
};

describe('WhatsNewModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <WhatsNewModal {...defaultProps} isOpen={false} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the latest release version and date when open', () => {
    render(<WhatsNewModal {...defaultProps} />);

    expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('Jun 24, 2026')).toBeInTheDocument();
  });

  it('renders the highlights of the latest release', () => {
    render(<WhatsNewModal {...defaultProps} />);

    expect(screen.getByText('Brand new dashboard')).toBeInTheDocument();
    expect(screen.getByText('See everything at once.')).toBeInTheDocument();
  });

  it('renders the improvements section when present', () => {
    render(<WhatsNewModal {...defaultProps} />);

    expect(screen.getByText('Improvements')).toBeInTheDocument();
    expect(screen.getByText('Faster reports')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<WhatsNewModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onClose).toHaveBeenCalled();
  });
});
