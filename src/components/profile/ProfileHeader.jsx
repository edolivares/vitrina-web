import { Calendar, Edit, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfileHeader({ user, onEditAvatar, onEditProfile }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col md:flex-row items-center gap-6 flex-1 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="w-20 h-20 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/5">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-xl bg-slate-800 text-slate-200 font-semibold">
              {user.name.split(' ').map(namePart => namePart[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={onEditAvatar}
            className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border border-slate-900 transition-all hover:scale-105 shadow-md flex items-center justify-center cursor-pointer"
            title="Cambiar foto de perfil"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left flex flex-col gap-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">{user.name}</h2>
          <span className="text-sm font-medium text-slate-400">{user.email}</span>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 border border-slate-800/80 rounded-full text-xs font-semibold text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Registrado: 12 Mayo 2024</span>
            </div>
            <div className="flex items-center px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
              <span>Usuario Verificado</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 border border-slate-800/80 rounded-full text-xs font-semibold text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>4.9 (124 reseñas)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto">
        <button
          onClick={onEditProfile}
          className="w-full md:w-auto px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:border-slate-700 active:scale-98 cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          Editar Perfil
        </button>
      </div>
    </div>
  );
}
