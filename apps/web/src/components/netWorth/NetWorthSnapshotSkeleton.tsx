import { PageLayout, Skeleton } from '../ui';

export function NetWorthSnapshotSkeleton() {
  return (
    <PageLayout data-testid="net-worth-snapshot-skeleton">
      <Skeleton className="mb-6 h-4 w-36" />
      <Skeleton className="mt-6 h-48" />
      <Skeleton className="mt-4 h-32" />
    </PageLayout>
  );
}
