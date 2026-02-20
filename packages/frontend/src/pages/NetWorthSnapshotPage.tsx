import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';

import { GET_NET_WORTH_SNAPSHOT } from '../graphql/netWorth';
import { NetWorthEntry, NetWorthSnapshot } from '../types/netWorth';
import { formatMoney } from '../utils/formatMoney';

interface SnapshotData {
  netWorthSnapshot: NetWorthSnapshot | null;
}

function EntriesSection({
  title,
  entries,
  total,
  colorClass,
}: {
  title: string;
  entries: Array<NetWorthEntry>;
  total: number;
  colorClass: string;
}) {
  if (entries.length === 0) {
    return null;
  }

  const byCategory = entries.reduce<Record<string, Array<NetWorthEntry>>>(
    (acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }
      acc[entry.category].push(entry);
      return acc;
    },
    {}
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>
        <span className={`font-semibold ${colorClass}`}>
          {formatMoney(total)} €
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {Object.entries(byCategory).map(([category, categoryEntries]) => (
          <div key={category}>
            <div className="bg-gray-50 px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
              {category}
            </div>
            {categoryEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  index < categoryEntries.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {entry.label}
                </span>
                <span className={`text-sm font-medium ${colorClass}`}>
                  {formatMoney(entry.amount)} €
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetWorthSnapshotPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<SnapshotData>(
    GET_NET_WORTH_SNAPSHOT,
    { variables: { id } }
  );

  if (loading) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.netWorthSnapshot) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-center text-red-500">
            {error ? 'Failed to load snapshot.' : 'Snapshot not found.'}
          </p>
        </div>
      </div>
    );
  }

  const snapshot = data.netWorthSnapshot;
  const assets = snapshot.entries.filter((entry) => entry.type === 'ASSET');
  const liabilities = snapshot.entries.filter(
    (entry) => entry.type === 'LIABILITY'
  );
  const isPositive = snapshot.netWorth >= 0;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
            {snapshot.title}
          </h1>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Assets
              </p>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                {formatMoney(snapshot.totalAssets)} €
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Liabilities
              </p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                {formatMoney(snapshot.totalLiabilities)} €
              </p>
            </div>

            <div
              className={`rounded-lg p-4 ${
                isPositive
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-orange-50 dark:bg-orange-900/20'
              }`}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Net Worth
              </p>
              <p
                className={`text-xl font-semibold ${
                  isPositive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {isPositive ? '' : '-'}
                {formatMoney(Math.abs(snapshot.netWorth))} €
              </p>
            </div>
          </div>
        </div>

        {assets.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <EntriesSection
              title="Assets"
              entries={assets}
              total={snapshot.totalAssets}
              colorClass="text-green-600 dark:text-green-400"
            />
          </div>
        )}

        {liabilities.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <EntriesSection
              title="Liabilities"
              entries={liabilities}
              total={snapshot.totalLiabilities}
              colorClass="text-red-600 dark:text-red-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
