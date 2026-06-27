import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from '@/components/layout/Sidebar';
import { mockGetPosts } from '@/api/posts';
import { useUser } from '@/context/UserContext';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { LoadingState } from '@/components/marketplace/LoadingState';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { formatPrice, formatRelativeTime } from '@/lib/format';
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
          fetchedPosts = fetchedPosts.filter(post => post.seller !== user.id);
        }

        setPosts(fetchedPosts.map(post => {
          const postDate = new Date(post.createdAt);

          return {
            ...post,
            relativeTime: formatRelativeTime(post.createdAt),
            isNew: postDate.getTime() > Date.now() - 3600000 * 24
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
