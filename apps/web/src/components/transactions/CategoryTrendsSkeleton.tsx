import { SPARKLINE_HEIGHT } from '../charts/CategoryTrendTile';
import { Skeleton } from '../ui';

const SKELETON_TILE_COUNT = 8;

function SkeletonTile() {
  return (
    <div className="border-border bg-bg-surface flex w-full flex-col rounded border p-4">
      <Skeleton className="h-5 w-24" />

      <div className="mt-1">
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="mt-3 w-full">
        <Skeleton className="w-full" style={{ height: SPARKLINE_HEIGHT }} />
      </div>
    </div>
  );
}

export function CategoryTrendsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
        <SkeletonTile key={index} />
      ))}
    </div>
  );
}
