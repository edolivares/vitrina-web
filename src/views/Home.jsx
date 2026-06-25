import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Heart, Clock, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from '@/components/Sidebar';
import { mockGetPosts } from '@/api/posts';
import { useUser } from '@/context/UserContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Badge } from '@/components/ui/badge';
import 'react-lazy-load-image-component/src/effects/blur.css';

export function Home() {
  const { user, toggleFavorite, isFavorite } = useUser();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const filters = {
          search: searchParams.get('search') || '',
          region: searchParams.get('region') || '',
          comuna: searchParams.get('comuna') || '',
          minPrice: searchParams.get('minPrice') || '',
          maxPrice: searchParams.get('maxPrice') || '',
          condition: searchParams.get('condition') || ''
        };
        let fetchedPosts = await mockGetPosts(filters);

        if (user) {
          fetchedPosts = fetchedPosts.filter(post => post.sellerId !== user.id);
        }

        const now = Date.now();
        const postsWithDerivedData = fetchedPosts.map(post => {
          const postDate = new Date(post.createdAt);
          const diffMs = now - postDate.getTime();
          const diffHours = Math.floor(diffMs / 3600000);

          let relativeTime;
          if (diffHours < 1) relativeTime = 'Hace unos momentos';
          else if (diffHours === 1) relativeTime = 'Hace 1 hora';
          else if (diffHours < 24) relativeTime = `Hace ${diffHours} horas`;
          else {
            const diffDays = Math.floor(diffHours / 24);
            relativeTime = diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
          }

          const isNew = postDate.getTime() > now - 3600000 * 24;

          return {
            ...post,
            relativeTime,
            isNew
          };
        });

        setPosts(postsWithDerivedData);
      } catch (error) {
        console.error('Error cargando publicaciones:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [searchParams, user]);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full items-start">
      <Sidebar />
      <div className="flex-1 flex flex-col p-6">
        <Helmet>
          <title>Inicio | Vitrina Marketplace</title>
          <meta name="description" content="Explora y encuentra las mejores ofertas locales en tu comuna. Vitrina es el marketplace P2P más moderno de Chile." />
        </Helmet>

        { }
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Sugerencias de hoy
          </h1>
          <p className="text-xs text-slate-400">
            {searchParams.get('comuna')
              ? `Mostrando publicaciones en ${searchParams.get('comuna')}, ${searchParams.get('region') || ''}`
              : searchParams.get('region')
                ? `Mostrando publicaciones en ${searchParams.get('region')}`
                : 'Mostrando publicaciones en todas las ubicaciones'}
          </p>
        </div>

        { }
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Buscando publicaciones...</span>
          </div>
        ) : posts.length === 0 ? (

          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center">
            <SlidersHorizontal className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No encontramos resultados</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Intenta modificando los términos de búsqueda o ampliando los filtros de ubicación en el panel lateral.
            </p>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
            {posts.map((post) => {
              const isFav = isFavorite(post.id);
              return (
                <div
                  key={post.id}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                >
                  { }
                  <Link to={`/publicacion/${post.id}`} className="aspect-square w-full bg-slate-950 overflow-hidden block relative">
                    <LazyLoadImage
                      src={post.images[0]}
                      alt={post.title}
                      effect="blur"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      wrapperClassName="w-full h-full"
                    />
                    { }
                    {post.condition && (
                      <Badge className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm tracking-wider uppercase border-none ${post.condition.toUpperCase() === 'NUEVO'
                        ? 'bg-indigo-600/90'
                        : 'bg-slate-800/90 border border-slate-700/40 text-slate-300'
                        }`}>
                        {post.condition}
                      </Badge>
                    )}
                  </Link>

                  { }
                  {user && post.sellerId !== user.id && (
                    <button
                      onClick={() => toggleFavorite(post.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-90 ${isFav
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-950/80'
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  { }
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex flex-col gap-1.5">
                      { }
                      <span className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                        {formatPrice(post.price)}
                      </span>
                      { }
                      <Link to={`/publicacion/${post.id}`} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors line-clamp-2">
                        {post.title}
                      </Link>
                    </div>

                    { }
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        <span>{post.comuna}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{post.relativeTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SlidersHorizontal(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
