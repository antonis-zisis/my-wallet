import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the given initials', () => {
    render(<Avatar initials="JS" label="Jane Smith" />);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });
});
