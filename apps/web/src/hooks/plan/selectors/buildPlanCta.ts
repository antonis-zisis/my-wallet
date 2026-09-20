import { type Plan } from '../../../types/plan';

export type PlanCtaAction =
  'CHECKOUT' | 'CURRENT' | 'PORTAL' | 'SELECT_FREE' | 'UNAVAILABLE';

export type PlanCta = {
  action: PlanCtaAction;
  label: string;
};

type BuildPlanCtaInput = {
  currentPlan: Plan | null;
  isCheckoutAvailable: boolean;
  plan: Plan;
};

export function buildPlanCta({
  currentPlan,
  isCheckoutAvailable,
  plan,
}: BuildPlanCtaInput): PlanCta {
  if (plan === currentPlan) {
    return { action: 'CURRENT', label: 'Current plan' };
  }

  if (plan === 'FREE') {
    return currentPlan === 'PRO'
      ? { action: 'PORTAL', label: 'Cancel in billing portal' }
      : { action: 'SELECT_FREE', label: 'Start with Free' };
  }

  if (!isCheckoutAvailable) {
    return { action: 'UNAVAILABLE', label: 'Not available yet' };
  }

  return currentPlan === null
    ? { action: 'CHECKOUT', label: 'Start with Pro' }
    : { action: 'CHECKOUT', label: 'Upgrade to Pro' };
}
