import { Card, Skeleton } from '../ui';

export function SubscriptionsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <Skeleton className="mb-3 h-3 w-1/2" />
          <Skeleton className="h-7 w-2/5" />
        </Card>
      ))}
    </div>
  );
}
