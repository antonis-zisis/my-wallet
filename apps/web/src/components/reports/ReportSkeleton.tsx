import { PageLayout, Skeleton } from '../ui';

export function ReportSkeleton() {
  return (
    <PageLayout data-testid="report-skeleton">
      <Skeleton className="mb-6 h-4 w-28" />
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="mt-4 h-14" />
      <Skeleton className="mt-4 h-14" />
      <Skeleton className="mt-4 h-48" />
    </PageLayout>
  );
}
