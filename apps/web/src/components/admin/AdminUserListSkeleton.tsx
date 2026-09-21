import { Card, Skeleton } from '../ui';

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 px-1 py-3">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-1.5 h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-24" />
    </li>
  );
}

export function AdminUserListSkeleton() {
  return (
    <Card>
      <ul
        className="divide-border divide-y"
        data-testid="admin-user-list-skeleton"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </ul>
    </Card>
  );
}
