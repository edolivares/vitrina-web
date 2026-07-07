import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatPrice } from '@/lib/format';
import { getPostMetricsFromApi } from '@/api/posts';

export function ProfileMetricsDialog({ post, chats, onOpenChange }) {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [realMetrics, setRealMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!post) {
      setRealMetrics(null);
      return;
    }

    let active = true;
    async function fetchRealMetrics() {
      setLoading(true);
      try {
        const data = await getPostMetricsFromApi(post.id);
        if (active) {
          setRealMetrics(data);
        }
      } catch (err) {
        console.error("Error al cargar métricas reales:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchRealMetrics();

    return () => {
      active = false;
    };
  }, [post]);

  let activeViews = '...';
  let interestRateVal = '...';

  if (!loading && realMetrics) {
    if (selectedPeriod === '24h') {
      activeViews = realMetrics.views.last24h;
    } else if (selectedPeriod === '48h') {
      activeViews = realMetrics.views.last48h;
    } else {
      activeViews = realMetrics.views.total;
    }

    const totalEngagements = realMetrics.favorites + realMetrics.conversations;
    if (activeViews > 0) {
      interestRateVal = `${Math.min(100, Math.round((totalEngagements / activeViews) * 100))}%`;
    } else {
      interestRateVal = '0%';
    }
  }

  return (
    <Dialog open={Boolean(post)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(92vw,920px)] max-w-none overflow-y-auto bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl sm:max-w-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100">Métricas de publicación</DialogTitle>
          <DialogDescription className="text-sm text-slate-400 mt-1">
            Datos en tiempo real obtenidos de la plataforma.
          </DialogDescription>
        </DialogHeader>

        {post && (
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

            {/* Selector de Rango de Periodo */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-800/40 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Métricas del Período</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-fit">
                <button
                  onClick={() => setSelectedPeriod('24h')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedPeriod === '24h'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => setSelectedPeriod('48h')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedPeriod === '48h'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Últimas 48h
                </button>
                <button
                  onClick={() => setSelectedPeriod('total')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedPeriod === 'total'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Desde creación
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard value={loading ? '...' : activeViews} label={`Visitas (${selectedPeriod === '24h' ? '24h' : selectedPeriod === '48h' ? '48h' : 'Total'})`} />
              <MetricCard value={loading ? '...' : (realMetrics ? realMetrics.favorites : '...')} label="Favoritos" />
              <MetricCard value={loading ? '...' : (realMetrics ? realMetrics.conversations : '...')} label="Conversaciones" />
              <MetricCard value={loading ? '...' : interestRateVal} label="Interés estimado" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Distribución de visitas reales</h4>
                    <p className="text-xs text-slate-500">Comparativa de tráfico por rango de tiempo.</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="flex flex-col gap-4 mt-6">
                  {/* Fila 24 horas */}
                  <div className="grid grid-cols-[100px_minmax(0,1fr)_48px] items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Últimas 24h</span>
                    <div className="h-3.5 overflow-hidden rounded-full bg-slate-900 border border-slate-800/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20 transition-all duration-500"
                        style={{ width: `${realMetrics && realMetrics.views.total > 0 ? Math.max(8, (realMetrics.views.last24h / realMetrics.views.total) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-bold text-cyan-400">{loading ? '...' : (realMetrics ? realMetrics.views.last24h : 0)}</span>
                  </div>

                  {/* Fila 48 horas */}
                  <div className="grid grid-cols-[100px_minmax(0,1fr)_48px] items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Últimas 48h</span>
                    <div className="h-3.5 overflow-hidden rounded-full bg-slate-900 border border-slate-800/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20 transition-all duration-500"
                        style={{ width: `${realMetrics && realMetrics.views.total > 0 ? Math.max(8, (realMetrics.views.last48h / realMetrics.views.total) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-bold text-indigo-400">{loading ? '...' : (realMetrics ? realMetrics.views.last48h : 0)}</span>
                  </div>

                  {/* Fila Total */}
                  <div className="grid grid-cols-[100px_minmax(0,1fr)_48px] items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Desde creación</span>
                    <div className="h-3.5 overflow-hidden rounded-full bg-slate-900 border border-slate-800/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 transition-all duration-500"
                        style={{ width: `${realMetrics && realMetrics.views.total > 0 ? 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-bold text-violet-400">{loading ? '...' : (realMetrics ? realMetrics.views.total : 0)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-sm font-bold text-slate-100">Resumen</h4>
                <div className="mt-4 flex flex-col gap-3 text-xs">
                  <SummaryRow label="Estado" value={post.status === 'PUBLISHED' ? 'Publicada' : post.status === 'SOLD' ? 'Vendida' : 'Archivada'} />
                  <SummaryRow label="Ubicación" value={post.comuna} />
                  <SummaryRow label="Último contacto" value={loading ? '...' : (realMetrics && realMetrics.lastContactAt ? formatDate(realMetrics.lastContactAt) : 'Sin mensajes')} />
                  <p className="rounded-xl bg-indigo-500/10 p-3 text-indigo-200">
                    {loading
                      ? 'Cargando resumen...'
                      : (realMetrics && realMetrics.conversations > 0
                        ? 'Esta publicación ya tiene conversaciones asociadas. Conviene responder desde la vista de mensajes filtrada.'
                        : 'Aún no hay conversaciones para esta publicación. Las visitas y favoritos ayudan a estimar interés inicial.')}
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
