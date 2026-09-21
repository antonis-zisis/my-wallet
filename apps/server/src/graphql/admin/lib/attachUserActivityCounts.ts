import prisma from '../../../lib/prisma';

type UserIdentity = { supabaseId: string };

export type UserActivityCounts = {
  sharedOwnedReportCount: number;
  transactionCount: number;
};

type AggregateRow = { userId: string; count: number };

// Transactions and shares hang off reports rather than off the user, so neither
// count is reachable through Prisma's relation `_count`. Aggregating in SQL keeps
// this to two bounded queries instead of loading every report row to count in JS.
export async function attachUserActivityCounts<Item extends UserIdentity>(
  users: Array<Item>
): Promise<Array<Item & UserActivityCounts>> {
  if (users.length === 0) {
    return [];
  }

  const supabaseIds = users.map((user) => user.supabaseId);

  const [transactionRows, sharedOwnedRows] = await Promise.all([
    prisma.$queryRaw<Array<AggregateRow>>`
      SELECT r.user_id AS "userId", COUNT(t.id)::int AS count
      FROM reports r
      JOIN transactions t ON t.report_id = r.id
      WHERE r.user_id = ANY(${supabaseIds})
      GROUP BY r.user_id
    `,
    prisma.$queryRaw<Array<AggregateRow>>`
      SELECT r.user_id AS "userId", COUNT(DISTINCT r.id)::int AS count
      FROM reports r
      JOIN report_shares s ON s.report_id = r.id
      WHERE r.user_id = ANY(${supabaseIds})
      GROUP BY r.user_id
    `,
  ]);

  const transactionsByUser = toCountMap(transactionRows);
  const sharedOwnedByUser = toCountMap(sharedOwnedRows);

  return users.map((user) => ({
    ...user,
    sharedOwnedReportCount: sharedOwnedByUser.get(user.supabaseId) ?? 0,
    transactionCount: transactionsByUser.get(user.supabaseId) ?? 0,
  }));
}

function toCountMap(rows: Array<AggregateRow>): Map<string, number> {
  return new Map(rows.map((row) => [row.userId, Number(row.count)]));
}
