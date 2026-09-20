import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { GET_ME, GET_PLANS, SELECT_PLAN } from '../../graphql/user';
import { type Plan, type PlanOption } from '../../types/plan';
import {
  buildPlanComparison,
  type PlanComparisonRow,
} from './selectors/buildPlanComparison';

type PlansData = {
  plans: Array<PlanOption>;
};

type UsePlanDataResult = {
  comparison: Array<PlanComparisonRow>;
  currentPlan: Plan | null;
  error: boolean;
  loading: boolean;
  onSelectPlan: (plan: Plan) => Promise<boolean>;
  selectingPlan: Plan | null;
};

export function usePlanData(): UsePlanDataResult {
  const { user } = useUser();
  const { showError } = useToast();
  const [selectingPlan, setSelectingPlan] = useState<Plan | null>(null);

  const { data, error, loading } = useQuery<PlansData>(GET_PLANS);
  const [selectPlan] = useMutation(SELECT_PLAN, {
    refetchQueries: [{ query: GET_ME }],
    awaitRefetchQueries: true,
  });

  const onSelectPlan = async (plan: Plan) => {
    setSelectingPlan(plan);

    try {
      await selectPlan({ variables: { input: { plan } } });

      return true;
    } catch {
      showError('Failed to change your plan. Please try again.');

      return false;
    } finally {
      setSelectingPlan(null);
    }
  };

  return {
    comparison: buildPlanComparison(data?.plans ?? []),
    currentPlan: user?.plan ?? null,
    error: !!error,
    loading: loading && !data,
    onSelectPlan,
    selectingPlan,
  };
}
