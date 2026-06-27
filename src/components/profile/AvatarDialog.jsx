import { Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function AvatarDialog({
  open,
  previewUrl,
  isDragActive,
  onOpenChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onCancel,
  onSave
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100">Cambiar Foto de Perfil</DialogTitle>
          <DialogDescription className="text-sm text-slate-400 mt-1">
            Arrastra una nueva foto o haz clic en la zona para seleccionarla desde tu equipo.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('avatar-input').click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-500/5'
                : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-950/60'
            }`}
          >
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelect}
            />

            {previewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Previsualización"
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg"
                />
                <span className="text-xs text-indigo-400 font-semibold">Previsualización del avatar</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-200">Arrastra tu imagen aquí</span>
                  <span className="text-xs text-slate-500">O haz clic para buscar archivo</span>
                </div>
                <span className="text-[10px] text-slate-600">Soporta PNG, JPG o WEBP (máx. 5MB)</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!previewUrl}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md ${
              previewUrl
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            Guardar Cambios
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
