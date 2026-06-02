type Trialable = {
  trialEndsAt: string | null;
};

export function isActiveTrial(subscription: Trialable): boolean {
  if (!subscription.trialEndsAt) {
    return false;
  }

  const value = /^\d+$/.test(subscription.trialEndsAt)
    ? Number(subscription.trialEndsAt)
    : subscription.trialEndsAt;

  return new Date(value) > new Date();
}
