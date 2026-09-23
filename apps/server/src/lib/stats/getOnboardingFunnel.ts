import prisma from '../prisma';

export type OnboardingFunnel = {
  completed: number;
  total: number;
  withContract: number;
  withFullName: number;
  withNetWorthSnapshot: number;
  withSubscription: number;
  withTransaction: number;
};

type FunnelRow = Record<keyof OnboardingFunnel, number>;

export async function getOnboardingFunnel(): Promise<OnboardingFunnel> {
  const [row] = await prisma.$queryRaw<Array<FunnelRow>>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE u.onboarding_completed_at IS NOT NULL
      )::int AS completed,
      COUNT(*) FILTER (
        WHERE u.full_name IS NOT NULL AND btrim(u.full_name) <> ''
      )::int AS "withFullName",
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM reports r
          JOIN transactions t ON t.report_id = r.id
          WHERE r.user_id = u.supabase_id
        ) OR EXISTS (
          SELECT 1 FROM transactions t WHERE t.created_by_id = u.supabase_id
        )
      )::int AS "withTransaction",
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM subscriptions s WHERE s.user_id = u.supabase_id
        )
      )::int AS "withSubscription",
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM contracts c WHERE c.user_id = u.supabase_id
        )
      )::int AS "withContract",
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM net_worth_snapshots n WHERE n.user_id = u.supabase_id
        )
      )::int AS "withNetWorthSnapshot"
    FROM users u
  `;

  return {
    completed: Number(row?.completed ?? 0),
    total: Number(row?.total ?? 0),
    withContract: Number(row?.withContract ?? 0),
    withFullName: Number(row?.withFullName ?? 0),
    withNetWorthSnapshot: Number(row?.withNetWorthSnapshot ?? 0),
    withSubscription: Number(row?.withSubscription ?? 0),
    withTransaction: Number(row?.withTransaction ?? 0),
  };
}
