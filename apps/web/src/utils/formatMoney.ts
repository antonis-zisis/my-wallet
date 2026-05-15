export function formatMoney(amount: number): string {
  return amount.toLocaleString('el-GR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoneyOrMask(amount: number, isHidden: boolean): string {
  return isHidden ? '***' : formatMoney(amount);
}
