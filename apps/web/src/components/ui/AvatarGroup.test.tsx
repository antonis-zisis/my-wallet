import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AvatarGroup } from './AvatarGroup';

describe('AvatarGroup', () => {
  it('renders an avatar for each person up to three', () => {
    render(
      <AvatarGroup
        people={[
          { initials: 'AA', label: 'Alice Adams' },
          { initials: 'BB', label: 'Bob Brown' },
        ]}
      />
    );

    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('BB')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('collapses people beyond three into a +N indicator', () => {
    render(
      <AvatarGroup
        people={[
          { initials: 'AA', label: 'Alice Adams' },
          { initials: 'BB', label: 'Bob Brown' },
          { initials: 'CC', label: 'Carol Clark' },
          { initials: 'DD', label: 'Dan Davis' },
          { initials: 'EE', label: 'Eve Evans' },
        ]}
      />
    );

    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('DD')).not.toBeInTheDocument();
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<AvatarGroup people={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
