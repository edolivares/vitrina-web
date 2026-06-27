import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatPrice } from '@/lib/format';
import { getPostMetrics } from '@/lib/profileMetrics';

export function ProfileMetricsDialog({ post, chats, onOpenChange }) {
  const metrics = post ? getPostMetrics(post, chats) : null;
  const maxWeekValue = metrics ? Math.max(...metrics.weeklyViews.map(day => day.value)) : 0;

  return (
    <Dialog open={Boolean(post)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(92vw,920px)] max-w-none overflow-y-auto bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl sm:max-w-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100">Métricas de publicación</DialogTitle>
          <DialogDescription className="text-sm text-slate-400 mt-1">
            Datos simulados para presentar el flujo de dashboard del vendedor.
          </DialogDescription>
        </DialogHeader>

        {post && metrics && (
          <div className="flex flex-col gap-5 py-4">
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
              <img
                src={post.images[0]}
                alt={post.title}
                className="h-32 w-full rounded-xl object-cover md:h-28"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Publicación</span>
                <h3 className="text-lg font-bold leading-snug text-slate-100">{post.title}</h3>
                <span className="text-sm font-semibold text-indigo-300">{formatPrice(post.price)}</span>
              </div>
              <Link
                to={`/mensajes/publicacion/${post.id}`}
                onClick={() => onOpenChange(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 md:w-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ver mensajes
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard value={metrics.views} label="Visitas" />
              <MetricCard value={metrics.favorites} label="Favoritos" />
              <MetricCard value={metrics.chatCount} label="Conversaciones" />
              <MetricCard value={`${metrics.conversion}%`} label="Interés estimado" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Visitas de la semana</h4>
                    <p className="text-xs text-slate-500">Distribución simulada para comparar días.</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="flex flex-col gap-3">
                  {metrics.weeklyViews.map((dayMetric) => (
                    <div key={dayMetric.day} className="grid grid-cols-[72px_minmax(0,1fr)_48px] items-center gap-3">
                      <span className="text-xs font-medium text-slate-400">{dayMetric.day}</span>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.max(10, (dayMetric.value / maxWeekValue) * 100)}%` }}
                        />
                      </div>
                      <span className="text-right text-xs font-semibold text-slate-200">{dayMetric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-sm font-bold text-slate-100">Resumen</h4>
                <div className="mt-4 flex flex-col gap-3 text-xs">
                  <SummaryRow label="Estado" value={post.status === 'PUBLISHED' ? 'Publicada' : post.status === 'SOLD' ? 'Vendida' : 'Archivada'} />
                  <SummaryRow label="Ubicación" value={post.comuna} />
                  <SummaryRow label="Último contacto" value={metrics.lastContact ? formatDate(metrics.lastContact) : 'Sin mensajes'} />
                  <p className="rounded-xl bg-indigo-500/10 p-3 text-indigo-200">
                    {metrics.chatCount > 0
                      ? 'Esta publicación ya tiene conversaciones asociadas. Conviene responder desde la vista de mensajes filtrada.'
                      : 'Aún no hay conversaciones para esta publicación. Las visitas y favoritos ayudan a estimar interés inicial.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ value, label }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <span className="block text-xl font-bold text-slate-100">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}
