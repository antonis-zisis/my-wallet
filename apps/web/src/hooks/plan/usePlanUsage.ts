import { useQuery } from '@apollo/client/react';

import { GET_PLAN_USAGE } from '../../graphql/user';
import { type PlanUsage } from '../../types/plan';
import { usePlan } from './usePlan';

type PlanUsageData = {
  planUsage: PlanUsage;
};

type UsePlanUsageResult = {
  usage: PlanUsage | null;
};

export function usePlanUsage(): UsePlanUsageResult {
  const { isPro } = usePlan();

  const { data } = useQuery<PlanUsageData>(GET_PLAN_USAGE, {
    fetchPolicy: 'cache-and-network',
    skip: isPro,
  });

  return { usage: data?.planUsage ?? null };
}
