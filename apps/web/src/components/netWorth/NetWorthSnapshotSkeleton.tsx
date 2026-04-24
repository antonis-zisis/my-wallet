import { Card, PageLayout, Skeleton } from '../ui';

function EntriesSectionSkeleton() {
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

      <EntriesSectionSkeleton />
      <EntriesSectionSkeleton />
    </PageLayout>
  );
}
