import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MockedProvider } from '../test/apollo-test-utils';
import { makeUser } from '../test/fixtures';
import { Profile } from './Profile';

const mockUpdateUser = vi.fn();
const mockUpdatePassword = vi.fn();

vi.mock('../contexts/UserContext', () => ({
  useUser: vi.fn().mockReturnValue({
    user: makeUser({ email: 'test@example.com', fullName: 'John Doe' }),
    loading: false,
    updateUser: (...args: Array<unknown>) => mockUpdateUser(...args),
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    session: { access_token: 'token' },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    updatePassword: (...args: Array<unknown>) => mockUpdatePassword(...args),
  }),
}));

vi.mock('../contexts/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

function renderProfile() {
  return render(
    <MockedProvider>
      <Profile />
    </MockedProvider>
  );
}

describe('Profile', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockUpdatePassword.mockReset();
  });

  it('renders email as non-editable display and fullName as editable input', () => {
    renderProfile();

    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
    expect(nameInput.value).toBe('John Doe');
    expect(nameInput).not.toHaveAttribute('readOnly');
  });

  it('renders Personal info and Change password section headings', () => {
    renderProfile();

    expect(
      screen.getByRole('heading', { name: 'Personal info' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Change password' })
    ).toBeInTheDocument();
  });

  describe('Save button', () => {
    it('is disabled when name has not changed', () => {
      renderProfile();

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('is enabled when name has changed', async () => {
      renderProfile();

      const nameInput = screen.getByLabelText('Full name');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Jane Doe');

      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });
  });

  describe('Change password button', () => {
    it('is disabled when password fields are empty', () => {
      renderProfile();

      expect(
        screen.getByRole('button', { name: 'Change password' })
      ).toBeDisabled();
    });

    it('is enabled when new password is entered', async () => {
      renderProfile();

      await userEvent.type(screen.getByLabelText('New password'), 'secret123');

      expect(
        screen.getByRole('button', { name: 'Change password' })
      ).toBeEnabled();
    });
  });

  it('invokes updateUser when the profile form is submitted', async () => {
    mockUpdateUser.mockResolvedValueOnce(undefined);
    renderProfile();

    const nameInput = screen.getByLabelText('Full name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');
    fireEvent.submit(screen.getAllByText('Save')[0].closest('form')!);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ fullName: 'Jane Doe' });
    });
  });

  describe('About section', () => {
    it('shows the app version', () => {
      renderProfile();

      expect(screen.getByText(/^v\d+\.\d+\.\d+$/)).toBeInTheDocument();
    });

    it("opens the What's New modal when the button is clicked", async () => {
      renderProfile();

      fireEvent.click(screen.getByRole('button', { name: "What's New" }));

      expect(
        screen.getByRole('heading', { name: "What's New" })
      ).toBeInTheDocument();
    });

    it('links to the Logo.dev attribution', () => {
      renderProfile();

      expect(screen.getByRole('link', { name: 'Logo.dev' })).toHaveAttribute(
        'href',
        'https://logo.dev'
      );
    });
  });

  describe('Preferences', () => {
    it('shows the current currency', () => {
      renderProfile();

      expect(screen.getByLabelText('Currency')).toHaveValue('EUR');
    });

    it('saves the currency the user picks', async () => {
      mockUpdateUser.mockResolvedValueOnce(undefined);
      renderProfile();

      await userEvent.selectOptions(screen.getByLabelText('Currency'), 'USD');

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({ currency: 'USD' });
      });
    });
  });

  it('invokes updatePassword when the password form is submitted', async () => {
    mockUpdatePassword.mockResolvedValueOnce({ error: null });
    renderProfile();

    await userEvent.type(screen.getByLabelText('New password'), 'newpass123');
    await userEvent.type(
      screen.getByLabelText('Confirm password'),
      'newpass123'
    );
    const passwordForm = screen.getByLabelText('New password').closest('form')!;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpass123');
    });
  });
});
