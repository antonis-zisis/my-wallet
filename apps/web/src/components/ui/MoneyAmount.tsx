import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatMoney } from '../../utils/formatMoney';

interface MoneyAmountProps {
  amount: number;
  className?: string;
  currency?: string;
  sign?: string;
}

export function MoneyAmount({
  amount,
  className,
  currency = '€',
  sign = '',
}: MoneyAmountProps) {
  const { isAmountsHidden } = usePrivacy();

  const suffix = currency ? ` ${currency}` : '';
  const text = isAmountsHidden
    ? `***${suffix}`
    : `${sign}${formatMoney(amount)}${suffix}`;

  if (className) {
    return <span className={className}>{text}</span>;
  }

  return <>{text}</>;
}
