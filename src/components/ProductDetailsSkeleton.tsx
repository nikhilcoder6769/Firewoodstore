import { Skeleton } from './Skeleton';

export function ProductDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="rounded-2xl w-full aspect-[4/3]" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="rounded-xl w-full aspect-square" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full mb-8" />
          
          <div className="bg-surface border border-border rounded-xl p-6 mb-8 relative">
            <Skeleton className="absolute top-6 right-6 w-10 h-10 rounded-full" />
            <Skeleton className="h-10 w-32 mb-6" />
            <Skeleton className="h-14 w-full rounded-xl" />
            
            <div className="mt-6 flex flex-col gap-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-56" />
            </div>
          </div>

          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full max-w-md" />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
