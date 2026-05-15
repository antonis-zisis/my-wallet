import { usePrivacy } from '../contexts/PrivacyContext';
import { EyeIcon, EyeOffIcon } from './icons';

export function PrivacyToggle() {
  const { isAmountsHidden, toggleAmountsHidden } = usePrivacy();

  return (
    <button
      aria-label={isAmountsHidden ? 'Show amounts' : 'Hide amounts'}
      className="text-text-secondary hover:bg-bg-muted hover:text-text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded transition-colors"
      onClick={toggleAmountsHidden}
    >
      <span className="h-4 w-4">
        {isAmountsHidden ? <EyeOffIcon /> : <EyeIcon />}
      </span>
    </button>
  );
}
