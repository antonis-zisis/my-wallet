export function getNextRenewalDate(
  startDate: Date,
  billingCycle: string
): Date {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const next = new Date(startDate);

  if (billingCycle === 'WEEKLY') {
    while (next <= today) {
      next.setDate(next.getDate() + 7);
    }
  } else {
    const increment =
      billingCycle === 'YEARLY'
        ? 12
        : billingCycle === 'BI_ANNUAL'
          ? 6
          : billingCycle === 'QUARTERLY'
            ? 3
            : 1;
    while (next <= today) {
      next.setMonth(next.getMonth() + increment);
    }
  }

  return next;
}
