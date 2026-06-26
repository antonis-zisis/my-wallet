import { EXPIRING_SOON_DAYS } from '../../hooks/contracts/selectors/computeExpiringSoon';
import { getDaysUntilExpiration } from '../../hooks/contracts/selectors/getDaysUntilExpiration';
import { Contract } from '../../types/contract';
import { formatDate } from '../../utils/formatDate';
import { Badge, Dropdown, MoneyAmount } from '../ui';
import { DropdownItem } from '../ui/Dropdown';

type ContractListRowProps = {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
};

function ExpiryBadge({ contract }: { contract: Contract }) {
  if (contract.isExpired) {
    return (
      <Badge variant="danger" size="sm">
        Expired
      </Badge>
    );
  }

  const daysUntil = getDaysUntilExpiration(contract);

  if (daysUntil !== null && daysUntil >= 0 && daysUntil <= EXPIRING_SOON_DAYS) {
    return (
      <Badge variant="warning" size="sm">
        Expiring soon
      </Badge>
    );
  }

  return null;
}

function ExpiryLine({ contract }: { contract: Contract }) {
  if (!contract.endDate) {
    return <span className="text-text-secondary shrink-0">Open-ended</span>;
  }

  const daysUntil = getDaysUntilExpiration(contract);
  const relativeLabel =
    daysUntil === null
      ? null
      : daysUntil < 0
        ? 'expired'
        : daysUntil === 0
          ? 'today'
          : daysUntil === 1
            ? 'tomorrow'
            : `in ${daysUntil}d`;

  return (
    <span className="text-text-secondary shrink-0">
      expires{' '}
      <span className="font-semibold">{formatDate(contract.endDate)}</span>
      {relativeLabel && ` · ${relativeLabel}`}
    </span>
  );
}

export function ContractListRow({
  contract,
  onDelete,
  onEdit,
}: ContractListRowProps) {
  const dropdownItems: Array<DropdownItem> = [
    { label: 'Edit', onClick: () => onEdit(contract) },
    {
      label: 'Delete',
      onClick: () => onDelete(contract),
      variant: 'danger',
    },
  ];

  return (
    <li
      className={`flex items-center gap-3 ${contract.isExpired ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 px-1 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-text-primary min-w-0 truncate font-medium">
              {contract.provider}
            </span>

            <Badge variant="default" size="sm">
              {contract.category}
            </Badge>

            <ExpiryBadge contract={contract} />
          </div>

          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs">
            {contract.plan && (
              <>
                <span className="text-text-tertiary min-w-0 truncate">
                  {contract.plan}
                </span>

                <span
                  aria-hidden="true"
                  className="text-text-tertiary shrink-0"
                >
                  ·
                </span>
              </>
            )}

            <ExpiryLine contract={contract} />
          </div>
        </div>

        {contract.cost !== null && (
          <div className="text-right">
            <p className="text-text-primary text-sm font-semibold">
              <MoneyAmount amount={contract.cost} />
            </p>
          </div>
        )}
      </div>

      <Dropdown className="relative shrink-0" items={dropdownItems} />
    </li>
  );
}
