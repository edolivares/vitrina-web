import { Skeleton } from '@/components/ui/skeleton';

export function ProfileCardsSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <Skeleton className="aspect-video rounded-none bg-slate-800" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-4/5 bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
            <Skeleton className="h-3 w-2/3 bg-slate-800" />
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-3">
              <Skeleton className="h-9 flex-1 rounded-lg bg-slate-800" />
              <Skeleton className="size-9 rounded-lg bg-slate-800" />
              <Skeleton className="size-9 rounded-lg bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
