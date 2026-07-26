import { Link } from 'react-router-dom';
import { Clock, Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { IconTooltip } from '@/components/feedback/IconTooltip';

export function ProductCard({ post, isFavorite = false, canFavorite = false, onToggleFavorite, formatPrice }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80">
      <Link to={`/publicacion/${post.id}`} className="relative block aspect-square w-full overflow-hidden bg-slate-950">
        <LazyLoadImage
          src={post.coverImage?.url || post.images[0]}
          placeholderSrc={post.coverImage?.placeholder || undefined}
          alt={post.title}
          effect="blur"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          wrapperClassName="w-full h-full"
        />
        {post.condition && (
          <Badge className="absolute left-3 top-3 border-none bg-indigo-600/90 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {post.condition}
          </Badge>
        )}
      </Link>

      {canFavorite && (
        <IconTooltip label={isFavorite ? 'Quitar de favoritos' : 'Guardar favorito'}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onToggleFavorite(post.id)}
            className={`absolute right-3 top-3 rounded-xl border backdrop-blur-md ${
              isFavorite
                ? 'border-rose-500/50 bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                : 'border-slate-800/80 bg-slate-950/60 text-slate-400 hover:bg-slate-950/80 hover:text-slate-200'
            }`}
          >
            <Heart className={isFavorite ? 'fill-current' : ''} />
            <span className="sr-only">{isFavorite ? 'Quitar de favoritos' : 'Guardar favorito'}</span>
          </Button>
        </IconTooltip>
      )}

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-lg font-bold tracking-tight text-slate-100">{formatPrice(post.price)}</span>
          <Link to={`/publicacion/${post.id}`} className="line-clamp-2 text-sm font-medium text-slate-300 transition-colors hover:text-indigo-400">
            {post.title}
          </Link>
        </div>

        <Separator className="my-3 bg-slate-800/60" />

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-slate-600" />
            {post.comuna}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-600" />
            {post.relativeTime}
          </span>
        </div>
      </div>
    </article>
  );
}
