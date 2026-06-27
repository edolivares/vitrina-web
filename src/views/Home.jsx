import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from '@/components/Sidebar';
import { mockGetPosts } from '@/api/posts';
import { useUser } from '@/context/UserContext';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ProductCard } from '@/components/ProductCard';
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
          condition: searchParams.get('condition') || '',
          sellerId: searchParams.get('sellerId') || ''
        };

        let fetchedPosts = await mockGetPosts(filters);

        if (user && !filters.sellerId) {
          fetchedPosts = fetchedPosts.filter(post => post.sellerId !== user.id);
        }

        const now = Date.now();
        setPosts(fetchedPosts.map(post => {
          const postDate = new Date(post.createdAt);
          const diffHours = Math.floor((now - postDate.getTime()) / 3600000);
          const diffDays = Math.floor(diffHours / 24);

          return {
            ...post,
            relativeTime:
              diffHours < 1
                ? 'Hace unos momentos'
                : diffHours === 1
                  ? 'Hace 1 hora'
                  : diffHours < 24
                    ? `Hace ${diffHours} horas`
                    : diffDays === 1
                      ? 'Hace 1 día'
                      : `Hace ${diffDays} días`,
            isNew: postDate.getTime() > now - 3600000 * 24
          };
        }));
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

        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Sugerencias de hoy
          </h1>
          <p className="text-xs text-slate-400">
            {searchParams.get('sellerId')
              ? 'Mostrando publicaciones de este vendedor'
              : searchParams.get('comuna')
                ? `Mostrando publicaciones en ${searchParams.get('comuna')}, ${searchParams.get('region') || ''}`
                : searchParams.get('region')
                  ? `Mostrando publicaciones en ${searchParams.get('region')}`
                  : 'Mostrando publicaciones en todas las ubicaciones'}
          </p>
        </div>

        {loading ? (
          <LoadingState label="Buscando publicaciones..." />
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
                canFavorite={Boolean(user && post.sellerId !== user.id)}
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
