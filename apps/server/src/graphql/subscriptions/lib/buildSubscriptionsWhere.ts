interface BuildSubscriptionsWhereInput {
  userId: string;
  active?: boolean;
  now: Date;
}

export function buildSubscriptionsWhere({
  active,
  now,
  userId,
}: BuildSubscriptionsWhereInput) {
  if (active === true) {
    return {
      userId,
      isActive: true,
      OR: [
        { cancelledAt: null },
        { cancelledAt: { not: null }, endDate: { gt: now } },
      ],
    };
  }

  if (active === false) {
    return {
      userId,
      OR: [
        { isActive: false },
        {
          isActive: true,
          cancelledAt: { not: null },
          endDate: { lte: now },
        },
      ],
    };
  }

  return { userId };
}
