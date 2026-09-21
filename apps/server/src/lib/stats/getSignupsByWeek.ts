import prisma from '../prisma';

export const SIGNUP_WEEKS = 12;

export type SignupBucket = {
  count: number;
  week: string;
};

type SignupRow = { count: number; week: Date };

export async function getSignupsByWeek(
  weeks = SIGNUP_WEEKS
): Promise<Array<SignupBucket>> {
  const rows = await prisma.$queryRaw<Array<SignupRow>>`
    SELECT date_trunc('week', created_at)::date AS week, COUNT(*)::int AS count
    FROM users
    WHERE created_at >= date_trunc('week', now()) - make_interval(weeks => ${weeks - 1}::int)
    GROUP BY 1
    ORDER BY 1
  `;

  return rows.map((row) => ({
    count: Number(row.count),
    week: new Date(row.week).toISOString().slice(0, 10),
  }));
}
