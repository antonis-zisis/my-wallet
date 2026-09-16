import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CollapsibleSection } from './CollapsibleSection';

const defaultProps = {
  isOpen: false,
  label: 'Archived items (3)',
  onToggle: vi.fn(),
};

describe('CollapsibleSection', () => {
  it('renders the label on the toggle', () => {
    render(
      <CollapsibleSection {...defaultProps}>
        <p>content</p>
      </CollapsibleSection>
    );

    expect(
      screen.getByRole('button', { name: 'Archived items (3)' })
    ).toBeInTheDocument();
  });

  it('reports the collapsed state to assistive technology', () => {
    render(
      <CollapsibleSection {...defaultProps}>
        <p>content</p>
      </CollapsibleSection>
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('calls onToggle when the header is clicked', async () => {
    const onToggle = vi.fn();

    render(
      <CollapsibleSection {...defaultProps} onToggle={onToggle}>
        <p>content</p>
      </CollapsibleSection>
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalled();
  });

  it('exposes the content when open', () => {
    render(
      <CollapsibleSection {...defaultProps} isOpen>
        <p>content</p>
      </CollapsibleSection>
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('points the toggle at the content it controls', () => {
    render(
      <CollapsibleSection {...defaultProps} isOpen>
        <p>content</p>
      </CollapsibleSection>
    );

    const contentId = screen.getByRole('button').getAttribute('aria-controls');

    expect(document.getElementById(contentId ?? '')).toHaveTextContent(
      'content'
    );
  });

  it('drops the toggle when it is not collapsible', () => {
    render(
      <CollapsibleSection {...defaultProps} isCollapsible={false} isOpen>
        <p>content</p>
      </CollapsibleSection>
    );

    expect(screen.getByText('Archived items (3)')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
