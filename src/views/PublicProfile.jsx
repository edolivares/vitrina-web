import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Star, UserRound } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getPublicProfile } from '@/api/posts';
import { useUser } from '@/context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { LoadingState } from '@/components/marketplace/LoadingState';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ReviewsDialog } from '@/components/profile/ReviewsDialog';
import { formatMonthYear, formatPrice, formatRelativeTime } from '@/lib/format';

export function PublicProfile() {
  const { profileId } = useParams();
  const { user, toggleFavorite, isFavorite } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const result = await getPublicProfile(profileId);
        setProfile(result.profile);
        setPosts(result.posts.map(post => ({
          ...post,
          relativeTime: formatRelativeTime(post.createdAt)
        })));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [profileId]);

  const activePostLabel = `${posts.length} ${posts.length === 1 ? 'publicación activa' : 'publicaciones activas'}`;

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <LoadingState label="Cargando perfil..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 p-6">
        <EmptyState
          icon={UserRound}
          title="Perfil no encontrado"
          description="No encontramos publicaciones activas asociadas a este perfil."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>{profile.name} | Vitrina</title>
        <meta name="description" content={`Revisa el perfil público de ${profile.name} y sus publicaciones activas en Vitrina.`} />
      </Helmet>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
          <Avatar className="size-24 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/5">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="bg-slate-800 text-xl font-semibold text-slate-200">
              {profile.name.split(' ').map(name => name[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">{profile.name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">{profile.bio}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-300">
                <Calendar className="size-3.5 text-slate-400" />
                Desde {formatMonthYear(profile.joinedAt)}
              </span>
              <button
                type="button"
                onClick={() => setIsReviewsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-500/30 hover:text-slate-100"
              >
                <Star className="size-3.5 fill-amber-500/20 text-amber-500" />
                {profile.reviewScore} ({profile.reviewCount} reseñas)
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                {activePostLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <ReviewsDialog
        open={isReviewsOpen}
        onOpenChange={setIsReviewsOpen}
        profileName={profile.name}
        reviewScore={profile.reviewScore}
        reviewCount={profile.reviewCount}
        reviewSummary={profile.reviewSummary}
        reviews={profile.reviews}
      />
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Publicaciones activas</h2>
          <p className="text-sm text-slate-400">Artículos disponibles publicados por este perfil.</p>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Sin publicaciones activas"
            description="Este perfil no tiene artículos disponibles por ahora."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
      </section>
    </div>
  );
}

