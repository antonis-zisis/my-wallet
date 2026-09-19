import { useMoneyFormatter } from '../../hooks/useMoneyFormatter';

type MoneyAmountProps = {
  amount: number;
  className?: string;
  showCurrency?: boolean;
  sign?: string;
};

export function MoneyAmount({
  amount,
  className,
  showCurrency = true,
  sign = '',
}: MoneyAmountProps) {
  const formatAmount = useMoneyFormatter();

  const text = formatAmount(amount, { showCurrency, sign });

  if (className) {
    return <span className={className}>{text}</span>;
  }

  return <>{text}</>;
}
