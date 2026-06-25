type BuildContractsWhereInput = {
  userId: string;
  expired?: boolean;
  now: Date;
  search?: string;
};

export function buildContractsWhere({
  expired,
  now,
  search,
  userId,
}: BuildContractsWhereInput) {
  const where: Record<string, unknown> = { userId };

  if (expired === true) {
    where.endDate = { lt: now };
  } else if (expired === false) {
    where.OR = [{ endDate: null }, { endDate: { gte: now } }];
  }

  const trimmedSearch = search?.trim();

  if (trimmedSearch) {
    where.provider = { contains: trimmedSearch, mode: 'insensitive' };
  }

  return where;
}
