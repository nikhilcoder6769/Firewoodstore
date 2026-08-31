import { Skeleton } from './Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5 flex flex-col flex-1">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex-1"></div>
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
