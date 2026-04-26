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
        <h2 className="text-text-primary text-lg font-semibold">{title}</h2>

        {isOpen ? (
          <ChevronUpIcon className="text-text-secondary h-5 w-5" />
        ) : (
          <ChevronDownIcon className="text-text-secondary h-5 w-5" />
        )}
      </button>

      {isOpen && <div className="mt-2">{children}</div>}
    </Card>
  );
}
