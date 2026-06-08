import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EntryDeltaLabel } from './EntryDeltaLabel';

describe('EntryDeltaLabel', () => {
  it('renders a "New" badge when the entry is new', () => {
    render(
      <EntryDeltaLabel
        currentAmount={3000}
        entryDelta={{ delta: 0, isNew: true }}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders a positive delta with a plus sign and percentage', () => {
    render(
      <EntryDeltaLabel
        currentAmount={5200}
        entryDelta={{ delta: 200, isNew: false }}
      />
    );

    expect(screen.getByText(/\+200,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/\+4\.0%/)).toBeInTheDocument();
  });

  it('renders a negative delta with a minus sign and percentage', () => {
    render(
      <EntryDeltaLabel
        currentAmount={4800}
        entryDelta={{ delta: -200, isNew: false }}
      />
    );

    expect(screen.getByText(/−200,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/−4\.0%/)).toBeInTheDocument();
  });

  it('renders nothing when the delta is zero and the entry is not new', () => {
    const { container } = render(
      <EntryDeltaLabel
        currentAmount={3000}
        entryDelta={{ delta: 0, isNew: false }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('omits the percentage when the previous amount was zero', () => {
    render(
      <EntryDeltaLabel
        currentAmount={500}
        entryDelta={{ delta: 500, isNew: false }}
      />
    );

    expect(screen.getByText(/\+500,00 €/)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
