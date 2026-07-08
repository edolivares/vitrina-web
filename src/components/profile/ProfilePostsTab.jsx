import { Archive, Edit, Eye, FileText, MessageSquare, Trash2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmAction } from '@/components/feedback/ConfirmAction';
import { formatPrice } from '@/lib/format';
import { getPostMetrics } from '@/lib/profileMetrics';

export function ProfilePostsTab({
  posts,
  sellerChats,
  chats,
  onEditPost,
  onUpdateStatus,
  onDeletePost,
  onOpenMetrics,
}) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
        <FileText className="w-8 h-8 text-slate-700" />
        <span className="text-sm font-medium">Aún no has creado publicaciones</span>
        <Link to="/publicar" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1">
          Crear mi primera publicación
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {posts.map((post) => {
        const metrics = getPostMetrics(post, sellerChats);
        const hasPostUnread = chats.some((chat) => chat.postId === post.id && chat.isUnread);

        return (
          <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
            <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
              <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />

              <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm tracking-wider uppercase border-none ${
                post.status === 'PUBLISHED'
                  ? 'bg-indigo-600/90'
                  : post.status === 'SOLD'
                    ? 'bg-blue-600/90'
                    : 'bg-slate-800/90 text-slate-300'
              }`}>
                {post.status === 'PUBLISHED' ? 'Publicada' : post.status === 'SOLD' ? 'Vendida' : 'Archivada'}
              </span>

              <div className="absolute top-3 right-3 bg-slate-950/60 border border-slate-800/80 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{metrics.views}</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-200 truncate">{post.title}</h3>
                <span className="text-sm font-semibold text-indigo-400">{formatPrice(post.price)}</span>
                <span className="text-[10px] text-slate-500">Actualizado: hace unos momentos</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-1">
                <Link
                  to={`/mensajes/publicacion/${post.id}`}
                  className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-250"
                  title="Ver mensajes de esta publicación"
                >
                  <div className="relative">
                    <MessageSquare className="w-4 h-4" />
                    {hasPostUnread && (
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => onEditPost(post)}
                  className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-250"
                  title="Editar publicación"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {post.status === 'PUBLISHED' ? (
                  <ConfirmAction
                    title="Archivar publicación"
                    description="La publicación dejará de estar disponible para compradores, pero podrás restaurarla desde tu perfil."
                    actionLabel="Archivar"
                    onConfirm={() => onUpdateStatus(post.id, 'ARCHIVED')}
                  >
                    <button
                      className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-250"
                      title="Archivar publicación"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </ConfirmAction>
                ) : (
                  <ConfirmAction
                    title="Restaurar publicación"
                    description="La publicación volverá a quedar disponible para compradores en la galería."
                    actionLabel="Restaurar"
                    onConfirm={() => onUpdateStatus(post.id, 'PUBLISHED')}
                  >
                    <button
                      className="p-2 rounded-lg bg-slate-950 text-emerald-500/80 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-250"
                      title="Publicar de nuevo"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </ConfirmAction>
                )}

                <button
                  onClick={() => onOpenMetrics(post)}
                  className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-250"
                  title="Estadísticas"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>

                <ConfirmAction
                  title="Eliminar publicación"
                  description="Esta acción quitará la publicación de tu listado."
                  actionLabel="Eliminar"
                  onConfirm={() => onDeletePost(post.id)}
                >
                  <button
                    className="p-2 rounded-lg bg-slate-950 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-250"
                    title="Eliminar publicación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </ConfirmAction>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
