import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the given initials', () => {
    render(<Avatar initials="JS" label="Jane Smith" />);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('exposes the label as an accessible name', () => {
    render(<Avatar initials="JS" label="Jane Smith" />);

    expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
  });
});
