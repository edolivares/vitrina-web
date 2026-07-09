import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from '@/components/layout/Sidebar';
import { getPosts } from '@/api/posts';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { LoadingState } from '@/components/marketplace/LoadingState';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { formatPrice, formatRelativeTime } from '@/lib/format';
import 'react-lazy-load-image-component/src/effects/blur.css';

export function Home() {
  const { user } = useUser();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        search: searchParams.get('search') || '',
        regionId: searchParams.get('regionId') || '',
        comuna: searchParams.get('comuna') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        condition: searchParams.get('condition') || '',
        sort: searchParams.get('sort') || 'newest',
      };

      let fetchedPosts = await getPosts(filters);

      if (user) {
        fetchedPosts = fetchedPosts.filter(post => post.seller !== user.id);
      }

      // Ordenar localmente según el filtro por si la API no lo soporta directamente o para consistencia de mock
      const sortVal = filters.sort;
      if (sortVal === 'price_asc') {
        fetchedPosts.sort((a, b) => a.price - b.price);
      } else if (sortVal === 'price_desc') {
        fetchedPosts.sort((a, b) => b.price - a.price);
      } else {
        // newest (por defecto)
        fetchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setPosts(fetchedPosts.map(post => {
        const postDate = new Date(post.createdAt);

        return {
          ...post,
          relativeTime: formatRelativeTime(post.createdAt),
          isNew: postDate.getTime() > Date.now() - 3600000 * 24
        };
      }));
    } catch (err) {
      console.error('Error cargando publicaciones:', err);
      setError('No pudimos conectar con el servidor. Por favor, verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full items-start">
      <Sidebar />
      <div className="flex-1 flex flex-col p-6">
        <Helmet>
          <title>Inicio | Vitrina Marketplace</title>
          <meta name="description" content="Explora y encuentra las mejores ofertas locales en tu comuna. Vitrina es el marketplace P2P más moderno de Chile." />
        </Helmet>

        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Sugerencias de hoy
          </h1>
          <p className="text-xs text-slate-400">
            {searchParams.get('comuna')
                ? `Mostrando publicaciones en ${searchParams.get('comuna')}`
                : searchParams.get('regionId')
                  ? 'Mostrando publicaciones en la región seleccionada'
                  : 'Mostrando publicaciones en todas las ubicaciones'}
          </p>
        </div>

        {loading ? (
          <LoadingState label="Buscando publicaciones..." />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-slate-900/35 rounded-2xl p-6 border border-slate-800/80 max-w-lg mx-auto w-full">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl w-fit animate-pulse">
              <SlidersHorizontal className="w-8 h-8 rotate-90" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Error de conexión</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <Button onClick={loadPosts} className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="No encontramos resultados"
            description="Intenta modificando los términos de búsqueda o ampliando los filtros de ubicación."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
            {posts.map((post) => (
              <ProductCard
                key={post.id}
                post={post}
                isFavorite={isFavorite(post.id)}
                canFavorite={Boolean(user && post.seller !== user.id)}
                onToggleFavorite={toggleFavorite}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
