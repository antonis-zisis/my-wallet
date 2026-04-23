import { Card, Divider, PageLayout, Skeleton } from '../ui';

function readCollapsed(title: string): boolean {
  try {
    const stored = localStorage.getItem(
      `netWorthSnapshot.${title}.isCollapsed`
    );
    return stored !== null ? (JSON.parse(stored) as boolean) : false;
  } catch {
    return false;
  }
}

function EntriesSectionSkeleton({ title }: { title: string }) {
  const isCollapsed = readCollapsed(title);

  return (
    <Card className="p-6">
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {[80, 56, 64].map((width) => (
            <Skeleton key={width} className={`h-3 w-${width}`} />
          ))}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="my-4">
            <Divider />
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {[0, 1, 2].map((rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-700"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export function NetWorthSnapshotSkeleton() {
  return (
    <PageLayout data-testid="net-worth-snapshot-skeleton" className="space-y-4">
      <Skeleton className="h-4 w-24" />

      <div className="mt-10 flex items-start justify-between">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <Card key={index}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-32" />
            <Skeleton className="mt-1 h-3 w-24" />
          </Card>
        ))}
      </div>

      <EntriesSectionSkeleton title="assets" />
      <EntriesSectionSkeleton title="liabilities" />
    </PageLayout>
  );
}
