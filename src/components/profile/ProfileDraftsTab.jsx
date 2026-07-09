import { AlertCircle, Edit, FileText, Trash2 } from 'lucide-react';
import { ConfirmAction } from '@/components/feedback/ConfirmAction';
import { FREE_ACCOUNT_LIMITS } from '@/config/constants';
import { formatPrice } from '@/lib/format';

export function ProfileDraftsTab({ drafts, onContinueDraft, onDeleteDraft }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 p-3 rounded-xl text-xs">
        <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <span>
          Borradores activos: <strong>{drafts.length} de {FREE_ACCOUNT_LIMITS.MAX_DRAFTS}</strong>. Los borradores te permiten guardar artículos incompletos para publicarlos después.
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800/80 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-slate-700" />
          <span className="text-sm font-medium">No tienes borradores pendientes</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
              <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                {draft.images?.[0] ? (
                  <img src={draft.images[0]} alt={draft.title || 'Borrador sin título'} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
                    <FileText className="w-8 h-8" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Sin imagen</span>
                  </div>
                )}

                <span className="absolute top-3 left-3 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950 backdrop-blur-sm">
                  Borrador
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-slate-200 truncate">{draft.title || 'Sin título'}</h3>
                  <span className="text-sm font-semibold text-indigo-400">{formatPrice(draft.price || 0)}</span>
                  <span className="text-[10px] text-slate-500">
                    {draft.comuna ? `Ubicación: ${draft.comuna}` : 'Ubicación pendiente'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onContinueDraft(draft.id)}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Continuar
                  </button>
                  <ConfirmAction
                    title="Eliminar borrador"
                    description="El borrador se eliminará y liberará uno de los cupos disponibles."
                    actionLabel="Eliminar"
                    onConfirm={() => onDeleteDraft(draft.id)}
                  >
                    <button
                      className="p-2 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar borrador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ConfirmAction>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
