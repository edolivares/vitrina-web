import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MAX_BIO_LINES = 5;
const getLineCount = (value) => value.split(/\r\n|\r|\n/).length;

export function EditProfileDialog({
  open,
  isSaving,
  name,
  bio,
  onOpenChange,
  onNameChange,
  onBioChange,
  onSave
}) {
  const bioLineCount = getLineCount(bio);

  const handleBioChange = (event) => {
    const nextBio = event.target.value;

    if (getLineCount(nextBio) <= MAX_BIO_LINES) {
      onBioChange(nextBio);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl">
        {isSaving && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/55 text-slate-100 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-indigo-300" />
            <span className="text-sm font-semibold">Guardando perfil...</span>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100">Editar Perfil</DialogTitle>
          <DialogDescription className="text-sm text-slate-400 mt-1">
            Actualiza los datos visibles de tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={isSaving} className="flex flex-col gap-4 py-4 disabled:opacity-75">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Nombre</label>
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="rounded-xl border-slate-800 bg-slate-950 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Bio</label>
            <Textarea
              value={bio}
              onChange={handleBioChange}
              maxLength={280}
              rows={5}
              className="min-h-28 resize-none rounded-xl border-slate-800 bg-slate-950 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-0"
            />
            <span className="self-end text-[11px] text-slate-500">
              {bio.length}/280 · {bioLineCount}/{MAX_BIO_LINES} líneas
            </span>
          </div>
        </fieldset>

        <DialogFooter className="flex items-center justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
