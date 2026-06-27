import { lazy, Suspense, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Heart, MessageSquare, Eye, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { mockGetPostById } from '@/api/posts';
import { mockCreateChat } from '@/api/messages';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { sileo } from 'sileo';
import { formatPrice } from '@/lib/format';

const PostImageGallery = lazy(() => import('@/components/marketplace/PostImageGallery'));

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite, isFavorite } = useUser();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const fetchedPost = await mockGetPostById(id);
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error cargando publicación:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Cargando detalles del artículo...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 text-center">
        <h3 className="text-lg font-bold text-slate-300">Publicación no encontrada</h3>
        <Link to="/" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-2 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a inicio
        </Link>
      </div>
    );
  }

  const handleContactSeller = async () => {
    if (!user) {

      navigate(`/login?redirect=/publicacion/${post.id}`);
      return;
    }

    setChatLoading(true);
    try {

      const chat = await mockCreateChat(post, user);

      navigate(`/mensajes/${chat.id}`);
    } catch (error) {
      sileo.error({
        title: 'No se pudo iniciar el chat',
        description: error.message || 'Intenta nuevamente en unos segundos.'
      });
    } finally {
      setChatLoading(false);
    }
  };

  const isFav = isFavorite(post.id);
  const isOwner = user && user.id === post.seller;
  const availabilityLabel = post.status === 'PUBLISHED'
    ? 'Disponible'
    : post.status === 'SOLD'
      ? 'Vendido'
      : 'No disponible';
  const availabilityClass = post.status === 'PUBLISHED'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : post.status === 'SOLD'
      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
      : 'border-slate-700 bg-slate-800 text-slate-300';

  return (
    <div className="flex-1 w-full p-6 flex flex-col gap-6">
      <Helmet>
        <title>{`${post.title} | Vitrina`}</title>
        <meta name="description" content={post.description ? `${post.description.slice(0, 155)}...` : 'Detalle de la publicación en Vitrina.'} />
      </Helmet>

      <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 w-fit transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a la galería
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-7 flex flex-col gap-4">
          {post.images.length > 1 ? (
            <Suspense
              fallback={
                <div className="aspect-square overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950">
                  <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
                </div>
              }
            >
              <PostImageGallery images={post.images} title={post.title} />
            </Suspense>
          ) : (
            <div className="aspect-square overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950">
              <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-indigo-400 font-sans">
                {formatPrice(post.price)}
              </span>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${availabilityClass}`}>
                  {availabilityLabel}
                </span>
                <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                  {post.condition || 'Sin estado'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{post.comuna}, {post.region}</span>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Descripción del Artículo
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-light">
              {post.description}
            </p>
          </div>

          <div className="h-px bg-slate-800/60" />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.sellerAvatar}
                alt={post.sellerName}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">{post.sellerName}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" /> Vendedor local
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleContactSeller}
                disabled={chatLoading || isOwner}
                className="w-full py-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border-none"
                size="lg"
              >
                {chatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                {isOwner ? 'Publicación Propia' : 'Contactar Vendedor'}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="py-4 rounded-xl text-xs font-semibold border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Link to={`/perfil/${post.seller}`}>
                    <Eye className="w-3.5 h-3.5" />
                    Ver más
                  </Link>
                </Button>

                <Button
                  onClick={() => toggleFavorite(post.id)}
                  disabled={!user || isOwner}
                  variant={isFav ? "destructive" : "outline"}
                  className={`py-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${isFav
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-55 disabled:cursor-not-allowed'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  {isFav ? 'Guardado' : 'Favorito'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ubicación aproximada
            </h3>
            <div className="h-32 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-30" />

              <div className="flex flex-col items-center gap-1.5 z-10 text-center px-4">
                <MapPin className="w-6 h-6 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {post.comuna}, Chile
                </span>
                <span className="text-[9px] text-slate-600">
                  Por seguridad, no se muestra el domicilio exacto
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
