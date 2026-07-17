import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows initials derived from the full name', () => {
    render(<Avatar email="jane@example.com" fullName="Jane Smith" />);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('falls back to the email first letter when there is no full name', () => {
    render(<Avatar email="jane@example.com" fullName={null} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
