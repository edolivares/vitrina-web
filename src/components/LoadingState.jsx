import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState({ label = 'Cargando...', variant = 'grid' }) {
  if (variant === 'chat') {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-lg bg-slate-800" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-2/3 bg-slate-800" />
              <Skeleton className="h-3 w-full bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12">
        <Skeleton className="aspect-square rounded-2xl bg-slate-800 lg:col-span-7" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skeleton className="h-8 w-4/5 bg-slate-800" />
          <Skeleton className="h-7 w-1/3 bg-slate-800" />
          <Skeleton className="h-28 rounded-2xl bg-slate-800" />
          <Skeleton className="h-40 rounded-2xl bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <Skeleton className="aspect-square bg-slate-800" />
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-5 w-2/3 bg-slate-800" />
              <Skeleton className="h-4 w-full bg-slate-800" />
              <Skeleton className="h-4 w-1/2 bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
