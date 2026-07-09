import { Eye, FolderHeart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/format';

export function ProfileFavoritesTab({ posts, onToggleFavorite }) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
        <FolderHeart className="w-8 h-8 text-slate-700" />
        <span className="text-sm font-medium">No tienes publicaciones guardadas como favoritas</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
          <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
            <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />

            <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm tracking-wider uppercase border-none ${
              post.status === 'PUBLISHED'
                ? 'bg-emerald-600/90'
                : post.status === 'SOLD'
                  ? 'bg-blue-600/90'
                  : 'bg-slate-800/90 text-slate-300'
            }`}>
              {post.status === 'PUBLISHED' ? 'Disponible' : post.status === 'SOLD' ? 'Vendido' : 'No disponible'}
            </span>

            <span className="absolute top-3 right-3 rounded bg-slate-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 backdrop-blur-sm">
              {post.condition || 'Usado'}
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-200 truncate">{post.title}</h3>
              <span className="text-sm font-semibold text-indigo-400">{formatPrice(post.price)}</span>
              <span className="text-[10px] text-slate-500">Ubicación: {post.comuna} · Condición: {post.condition || 'Usado'}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between gap-2">
              <Link
                to={`/publicacion/${post.id}`}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver Artículo
              </Link>

              <button
                onClick={() => onToggleFavorite(post.id)}
                className="p-2 rounded-lg bg-slate-950 text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Quitar de favoritos"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
