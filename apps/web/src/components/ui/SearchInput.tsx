import { ChangeEvent } from 'react';

import { SearchIcon, XMarkIcon } from '../icons';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  className = '',
  onChange,
  placeholder = 'Search…',
  value,
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="text-text-tertiary pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />

      <input
        type="text"
        role="searchbox"
        aria-label={placeholder}
        className="focus:border-brand-500 focus:ring-brand-500 border-border-strong text-text-primary bg-bg-surface placeholder-text-tertiary dark:bg-bg-muted w-full rounded border py-2 pr-8 pl-8 text-sm focus:ring-1 focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />

      {value && (
        <button
          aria-label="Clear search"
          className="text-text-tertiary hover:text-text-primary absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
          type="button"
          onClick={() => onChange('')}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
