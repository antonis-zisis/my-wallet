import { useEffect, useState } from 'react';

import { AdminUser } from '../../types/admin';
import { Button, Input, Modal } from '../ui';

type DeleteUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmEmail: string) => void;
  user: AdminUser | null;
  isDeleting: boolean;
};

export function DeleteUserModal({
  isDeleting,
  isOpen,
  onClose,
  onConfirm,
  user,
}: DeleteUserModalProps) {
  const [confirmEmail, setConfirmEmail] = useState('');

  useEffect(() => {
    setConfirmEmail('');
  }, [isOpen, user?.supabaseId]);

  if (!user) {
    return null;
  }

  const matches =
    confirmEmail.trim().toLowerCase() === user.email.trim().toLowerCase();

  const items = [
    { count: user.counts.reports, label: 'reports' },
    { count: user.counts.transactions, label: 'transactions' },
    { count: user.counts.subscriptions, label: 'subscriptions' },
    { count: user.counts.contracts, label: 'contracts' },
    { count: user.counts.netWorthSnapshots, label: 'net worth snapshots' },
  ].filter((item) => item.count > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!matches}
            isLoading={isDeleting}
            onClick={() => onConfirm(user.email.trim().toLowerCase())}
          >
            Delete permanently
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          This permanently deletes{' '}
          <span className="font-semibold">{user.email}</span> and their sign-in
          account. It cannot be undone.
        </p>

        {items.length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              The following will be destroyed:
            </p>
            <ul className="mt-1.5 list-inside list-disc text-sm text-red-700 dark:text-red-300">
              {items.map((item) => (
                <li key={item.label}>
                  {item.count} {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {user.counts.sharedOwnedReports > 0 && (
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {user.counts.sharedOwnedReports} of their reports{' '}
            {user.counts.sharedOwnedReports === 1 ? 'is' : 'are'} shared with
            other people, who will lose access.
          </p>
        )}

        <Input
          autoComplete="off"
          id="delete-user-confirm-email"
          label={`Type ${user.email} to confirm`}
          placeholder={user.email}
          value={confirmEmail}
          onChange={(event) => setConfirmEmail(event.target.value)}
        />
      </div>
    </Modal>
  );
}
