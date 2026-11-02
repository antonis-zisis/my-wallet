import { ContractCategoryTotal } from '../../types/contract';
import { CategoryBreakdownBar } from './CategoryBreakdownBar';
import { CONTRACT_CATEGORY_COLORS } from './categoryColors';

type ContractCategoryBreakdownChartProps = {
  breakdown: Array<ContractCategoryTotal>;
  loading?: boolean;
};

export function ContractCategoryBreakdownChart({
  breakdown,
  loading,
}: ContractCategoryBreakdownChartProps) {
  return (
    <CategoryBreakdownBar
      breakdown={breakdown}
      colors={CONTRACT_CATEGORY_COLORS}
      loading={loading}
    />
  );
}
