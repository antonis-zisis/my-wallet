import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders with the placeholder as its accessible name', () => {
    render(
      <SearchInput value="" placeholder="Search reports…" onChange={vi.fn()} />
    );

    expect(
      screen.getByRole('searchbox', { name: 'Search reports…' })
    ).toBeInTheDocument();
  });

  it('calls onChange with the typed value', async () => {
    const onChange = vi.fn();

    render(<SearchInput value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole('searchbox'), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('shows a clear button only when there is a value and clears on click', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchInput value="" onChange={onChange} />);

    expect(
      screen.queryByRole('button', { name: 'Clear search' })
    ).not.toBeInTheDocument();

    rerender(<SearchInput value="netflix" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
