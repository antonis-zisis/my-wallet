import { Link } from 'react-router';

import { Button, Modal } from '../ui';

type UpgradeModalProps = {
  description: string;
  isOpen: boolean;
  onClose: () => void;
};

export function UpgradeModal({
  description,
  isOpen,
  onClose,
}: UpgradeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade to Pro"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>

          <Link
            to="/select-plan"
            className="bg-brand-500 hover:bg-brand-600 inline-flex items-center rounded px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Compare plans
          </Link>
        </>
      }
    >
      <p className="text-text-secondary text-sm">{description}</p>

      <p className="text-text-tertiary mt-3 text-sm">
        Everything you have already added stays exactly where it is.
      </p>
    </Modal>
  );
}
