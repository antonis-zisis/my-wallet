type ComputeSavingsRateInput = {
  totalExpenses: number;
  totalIncome: number;
};

export function computeSavingsRate({
  totalExpenses,
  totalIncome,
}: ComputeSavingsRateInput): number | null {
  if (totalIncome <= 0) {
    return null;
  }

  return Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
}
