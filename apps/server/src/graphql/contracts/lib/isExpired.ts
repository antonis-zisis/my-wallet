type ExpiryInput = {
  endDate: Date | null;
};

export function isExpired(
  contract: ExpiryInput,
  now: Date = new Date()
): boolean {
  return contract.endDate !== null && contract.endDate < now;
}
