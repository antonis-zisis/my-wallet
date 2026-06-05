import { BillingCycle } from '../types/subscription';

export function formatUrgencyLabel(days: number): string {
  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Tomorrow';
  }

  return `in ${days}d`;
}

export function getUrgencyColor(days: number): string {
  if (days <= 3) {
    return 'text-red-600 dark:text-red-400';
  }

  if (days <= 7) {
    return 'text-amber-600 dark:text-amber-400';
  }

  return 'text-text-tertiary';
}

export function billingCycleLabel(billingCycle: BillingCycle): string {
  return billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly';
}
