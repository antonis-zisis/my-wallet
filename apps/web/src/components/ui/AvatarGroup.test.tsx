import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AvatarGroup } from './AvatarGroup';

describe('AvatarGroup', () => {
  it('renders an avatar for each person up to three', () => {
    render(
      <AvatarGroup
        people={[
          { email: 'a@example.com', fullName: 'Alice Adams' },
          { email: 'b@example.com', fullName: 'Bob Brown' },
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
          { email: 'a@example.com', fullName: 'Alice Adams' },
          { email: 'b@example.com', fullName: 'Bob Brown' },
          { email: 'c@example.com', fullName: 'Carol Clark' },
          { email: 'd@example.com', fullName: 'Dan Davis' },
          { email: 'e@example.com', fullName: 'Eve Evans' },
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
