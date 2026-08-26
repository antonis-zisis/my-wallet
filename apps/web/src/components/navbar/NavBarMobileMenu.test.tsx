import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { NavBarMobileMenu } from './NavBarMobileMenu';
import { navLinks } from './navLinks';

const renderMenu = () =>
  render(
    <MemoryRouter>
      <NavBarMobileMenu />
    </MemoryRouter>
  );

describe('NavBarMobileMenu', () => {
  it('keeps the navigation links out of the document while closed', () => {
    renderMenu();

    expect(
      screen.queryByRole('link', { name: 'Reports' })
    ).not.toBeInTheDocument();
  });

  it('reveals every navigation link when opened', async () => {
    renderMenu();

    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    );

    for (const link of navLinks) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.to
      );
    }
  });

  it('closes when a navigation link is followed', async () => {
    renderMenu();
    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    );

    await userEvent.click(screen.getByRole('link', { name: 'Contracts' }));

    expect(
      screen.queryByRole('link', { name: 'Contracts' })
    ).not.toBeInTheDocument();
  });

  it('closes when the toggle is pressed again', async () => {
    renderMenu();
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });

    await userEvent.click(toggle);
    await userEvent.click(
      screen.getByRole('button', { name: 'Close navigation menu' })
    );

    expect(
      screen.queryByRole('link', { name: 'Reports' })
    ).not.toBeInTheDocument();
  });
});
