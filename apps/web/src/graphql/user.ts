import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      fullName
      currency
      plan
      entitlements {
        canExportCsv
        canShareReports
        maxContracts
        maxNetWorthSnapshots
        maxReports
        maxSubscriptions
        maxTrendMonths
      }
      supabaseId
    }
  }
`;

export const GET_PLANS = gql`
  query GetPlans {
    plans {
      plan
      entitlements {
        canExportCsv
        canShareReports
        maxContracts
        maxNetWorthSnapshots
        maxReports
        maxSubscriptions
        maxTrendMonths
      }
    }
  }
`;

export const GET_PLAN_USAGE = gql`
  query GetPlanUsage {
    planUsage {
      activeSubscriptions
      contracts
      netWorthSnapshots
      reports
    }
  }
`;

export const SELECT_PLAN = gql`
  mutation SelectPlan($input: SelectPlanInput!) {
    selectPlan(input: $input) {
      id
      plan
      entitlements {
        canExportCsv
        canShareReports
        maxContracts
        maxNetWorthSnapshots
        maxReports
        maxSubscriptions
        maxTrendMonths
      }
    }
  }
`;

export const UPDATE_ME = gql`
  mutation UpdateMe($input: UpdateUserInput!) {
    updateMe(input: $input) {
      id
      email
      fullName
      currency
      supabaseId
    }
  }
`;

export const GET_ONBOARDING = gql`
  query GetOnboarding {
    me {
      id
      onboardingCompletedAt
      onboardingProgress {
        hasContract
        hasFullName
        hasNetWorthSnapshot
        hasSubscription
        hasTransaction
      }
    }
  }
`;

export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding {
    completeOnboarding {
      id
      onboardingCompletedAt
    }
  }
`;

export const RESET_ONBOARDING = gql`
  mutation ResetOnboarding {
    resetOnboarding {
      id
      onboardingCompletedAt
    }
  }
`;
