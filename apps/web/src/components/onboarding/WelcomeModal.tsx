import { type ReactNode, useState } from 'react';

import { type Currency, CURRENCY_OPTIONS } from '../../types/currency';
import {
  CreditCardIcon,
  DocumentTextIcon,
  EyeOffIcon,
  TrendingChartIcon,
  UserPlusIcon,
  WalletIcon,
} from '../icons';
import { Button, Input, Modal, Select } from '../ui';

type WelcomeModalProps = {
  initialCurrency: Currency;
  initialFullName: string;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: { currency: Currency; fullName: string }) => void;
};

type WelcomeRowProps = {
  description: string;
  icon: ReactNode;
  title: string;
};

function WelcomeRow({ description, icon, title }: WelcomeRowProps) {
  return (
    <li className="flex items-start gap-3">
      <span className="bg-bg-muted text-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded">
        <span className="h-4 w-4">{icon}</span>
      </span>

      <div>
        <p className="text-text-primary text-sm font-medium">{title}</p>
        <p className="text-text-secondary text-xs">{description}</p>
      </div>
    </li>
  );
}

export function WelcomeModal({
  initialCurrency,
  initialFullName,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: WelcomeModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fullName, setFullName] = useState(initialFullName);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);

  const isLastStep = stepIndex === 2;

  const handleNext = () => {
    if (isLastStep) {
      onSubmit({ currency, fullName });

      return;
    }

    setStepIndex((previous) => previous + 1);
  };

  return (
    <Modal
      closeOnBackdropClick={false}
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to My Wallet"
      footer={
        <>
          {stepIndex > 0 && (
            <Button
              variant="secondary"
              disabled={isSaving}
              onClick={() => setStepIndex((previous) => previous - 1)}
            >
              Back
            </Button>
          )}

          <Button isLoading={isSaving} onClick={handleNext}>
            {isLastStep ? 'Get started' : 'Next'}
          </Button>
        </>
      }
    >
      {stepIndex === 0 && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Everything you track lives in one of four places.
          </p>

          <ul className="space-y-3">
            <WelcomeRow
              description="A report is a period you name, like September 2026. Log income and expenses inside it."
              icon={<DocumentTextIcon />}
              title="Reports"
            />
            <WelcomeRow
              description="Your recurring bills, what they cost per month, and when they renew."
              icon={<CreditCardIcon />}
              title="Subscriptions"
            />
            <WelcomeRow
              description="Services you are tied into, so you hear about an expiry before it happens."
              icon={<WalletIcon />}
              title="Contracts"
            />
            <WelcomeRow
              description="What you own and what you owe, captured as a snapshot over time."
              icon={<TrendingChartIcon />}
              title="Net Worth"
            />
          </ul>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Two quick things. You can change both later in your profile.
          </p>

          <Input
            autoFocus
            id="welcome-full-name"
            label="Your name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />

          <div>
            <Select
              id="welcome-currency"
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
            />

            <p className="text-text-tertiary mt-1 text-xs">
              This changes how amounts are displayed. It does not convert
              existing amounts.
            </p>
          </div>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            A few things worth knowing.
          </p>

          <ul className="space-y-3">
            <WelcomeRow
              description="The eye icon in the top bar hides every amount, for when someone is looking over your shoulder."
              icon={<EyeOffIcon />}
              title="Hide your amounts"
            />
            <WelcomeRow
              description="Share a report with someone to view or edit it together. They need an account first."
              icon={<UserPlusIcon />}
              title="Share a report"
            />
            <WelcomeRow
              description="Add My Wallet to your home screen from your phone browser and it opens like an app."
              icon={<TrendingChartIcon />}
              title="Use it on your phone"
            />
          </ul>
        </div>
      )}
    </Modal>
  );
}
