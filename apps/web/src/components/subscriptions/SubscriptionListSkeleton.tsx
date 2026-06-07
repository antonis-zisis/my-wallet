import { Card, Skeleton } from '../ui';

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-1 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14 rounded" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-44" />
        </div>
        <div className="space-y-1.5 text-right">
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 shrink-0 rounded" />
    </li>
  );
}

export function SubscriptionListSkeleton() {
  return (
    <Card>
      <ul
        className="divide-border divide-y"
        data-testid="subscription-list-skeleton"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </ul>
    </Card>
  );
}
