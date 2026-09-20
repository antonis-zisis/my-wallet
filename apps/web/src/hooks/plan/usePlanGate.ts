import { useState } from 'react';

import {
  PLAN_CAPABILITY_MESSAGES,
  PLAN_LIMIT_LABELS,
  type PlanCapabilityKey,
  type PlanLimitKey,
} from '../../types/plan';
import { usePlan } from './usePlan';

type UsePlanGateResult = {
  guardCapability: (
    capability: PlanCapabilityKey,
    action: () => void
  ) => () => void;
  guardLimit: (
    limit: PlanLimitKey,
    count: number,
    action: () => void
  ) => () => void;
  onCloseUpgrade: () => void;
  showUpgrade: (message: string) => void;
  upgradeMessage: string | null;
};

export function usePlanGate(): UsePlanGateResult {
  const { entitlements, hasReachedLimit, limitFor } = usePlan();
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const guardLimit = (
    limit: PlanLimitKey,
    count: number,
    action: () => void
  ) => {
    return () => {
      if (!hasReachedLimit(limit, count)) {
        action();

        return;
      }

      const label = PLAN_LIMIT_LABELS[limit];

      setUpgradeMessage(
        `You have used all ${limitFor(limit)} ${label} the Free plan includes. Upgrade to Pro for unlimited ${label}.`
      );
    };
  };

  const guardCapability = (
    capability: PlanCapabilityKey,
    action: () => void
  ) => {
    return () => {
      if (entitlements?.[capability] ?? false) {
        action();

        return;
      }

      setUpgradeMessage(PLAN_CAPABILITY_MESSAGES[capability]);
    };
  };

  return {
    guardCapability,
    guardLimit,
    onCloseUpgrade: () => setUpgradeMessage(null),
    showUpgrade: setUpgradeMessage,
    upgradeMessage,
  };
}
