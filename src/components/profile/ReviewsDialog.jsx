import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/format';

export function ReviewsDialog({
  open,
  onOpenChange,
  profileName,
  reviewScore,
  reviewCount,
  reviewSummary,
  reviews
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(92vw,820px)] max-w-none overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Reseñas de {profileName}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Resumen simulado de experiencias asociadas a publicaciones anteriores.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 pt-2 sm:grid-cols-[1fr_140px] sm:items-center">
          <div className="flex flex-col gap-2">
            {reviewSummary.map((row) => {
              const width = reviewCount > 0 ? (row.count / reviewCount) * 100 : 0;

              return (
                <div key={row.rating} className="grid grid-cols-[16px_minmax(0,1fr)_28px] items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">{row.rating}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.max(width, row.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <span className="text-right text-[10px] font-medium text-slate-500">{row.count}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
            <span className="text-5xl font-black tracking-tight text-slate-100">{reviewScore.toFixed(1)}</span>
            <div className="mt-1 flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-4 fill-current" />
              ))}
            </div>
            <span className="mt-1 text-xs font-semibold text-slate-400">{reviewCount} reseñas</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-slate-100">Últimas reseñas</h3>
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{review.author}</h3>
                  <span className="text-xs text-slate-500">{formatDate(review.date)}</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {review.rating}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{review.comment}</p>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
