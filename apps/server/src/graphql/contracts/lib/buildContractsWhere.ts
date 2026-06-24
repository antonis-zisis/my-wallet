type BuildContractsWhereInput = {
  userId: string;
  expired?: boolean;
  now: Date;
};

export function buildContractsWhere({
  expired,
  now,
  userId,
}: BuildContractsWhereInput) {
  if (expired === true) {
    return { userId, endDate: { lt: now } };
  }

  if (expired === false) {
    return {
      userId,
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    };
  }

  return { userId };
}
