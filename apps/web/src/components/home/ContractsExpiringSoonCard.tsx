import { Link } from 'react-router-dom';

import { ExpiringContract } from '../../hooks/contracts/selectors/computeExpiringSoon';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ChevronDownIcon } from '../icons';
import { Badge, Card, Skeleton } from '../ui';

type ContractsExpiringSoonCardProps = {
  loading: boolean;
  contracts: Array<ExpiringContract>;
};

const VISIBLE_LIMIT = 3;

function formatCountdown(days: number): string {
  if (days === 0) {
    return 'expires today';
  }

  if (days === 1) {
    return 'expires tomorrow';
  }

  return `expires in ${days} days`;
}

function EmptyState() {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <p className="text-text-secondary text-sm font-medium">
        No contracts expiring soon
      </p>

      <Link
        to="/contracts"
        className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline"
      >
        Manage contracts
      </Link>
    </div>
  );
}

export function ContractsExpiringSoonCard({
  contracts,
  loading,
}: ContractsExpiringSoonCardProps) {
  const [isOpen, setIsOpen] = useLocalStorage(
    'home.contractsExpiringSoon.isOpen',
    true
  );

  const visible = contracts.slice(0, VISIBLE_LIMIT);
  const overflow = contracts.length - visible.length;

  return (
    <Card>
      {loading ? (
        <div className="flex w-full items-center gap-2">
          <Skeleton className="h-7 w-44" />
          <ChevronDownIcon className="text-border ml-auto h-5 w-5" />
        </div>
      ) : (
        <button
          aria-expanded={isOpen}
          type="button"
          className="flex w-full cursor-pointer items-center gap-2"
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <h2 className="text-text-primary text-lg font-semibold">
            Contracts Expiring Soon
          </h2>

          <ChevronDownIcon
            className={`text-text-secondary ml-auto h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      <div
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </>
            ) : contracts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <ul className="divide-border divide-y">
                  {visible.map((contract) => (
                    <li
                      key={contract.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-text-primary truncate text-sm font-medium">
                          {contract.provider}
                        </span>
                        <Badge variant="default" size="sm">
                          {contract.category}
                        </Badge>
                      </div>

                      <span className="text-text-secondary shrink-0 text-xs">
                        {formatCountdown(contract.daysUntilExpiration)}
                      </span>
                    </li>
                  ))}
                </ul>

                {overflow > 0 && (
                  <Link
                    to="/contracts"
                    className="text-brand-600 dark:text-brand-400 mt-3 inline-block text-sm font-semibold hover:underline"
                  >
                    +{overflow} more
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
