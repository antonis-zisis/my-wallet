import { ReactNode } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '../icons';
import { Card } from '../ui';

interface ReportChartSectionProps {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  onToggle: () => void;
}

export function ReportChartSection({
  children,
  isOpen,
  onToggle,
  title,
}: ReportChartSectionProps) {
  return (
    <Card className="mt-4">
      <button
        type="button"
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between"
        onClick={onToggle}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isOpen && <div className="mt-2">{children}</div>}
    </Card>
  );
}
