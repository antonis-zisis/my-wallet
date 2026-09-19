import { Link } from 'react-router';

import { OnboardingStep } from '../../types/onboarding';
import { ChevronRightIcon } from '../icons';

export function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
          step.isDone
            ? 'border-transparent bg-emerald-500 text-white'
            : 'border-border-strong text-transparent'
        }`}
      >
        ✓
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            step.isDone
              ? 'text-text-tertiary line-through'
              : 'text-text-primary'
          }`}
        >
          {step.label}
        </p>

        {!step.isDone && (
          <p className="text-text-secondary text-xs">{step.description}</p>
        )}
      </div>

      {!step.isDone && (
        <Link
          to={step.to}
          className="text-brand-600 dark:text-brand-400 flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline"
        >
          {step.actionLabel}
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      )}
    </li>
  );
}
