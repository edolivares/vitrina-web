import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProfileTabsNav({ userPostsCount, draftsCount, favoritesCount }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <TabsList className="bg-slate-900 border border-slate-800/80 p-1.5 rounded-2xl flex gap-2 w-full max-w-xl justify-start h-auto">
        <TabsTrigger
          value="posts"
          className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 bg-transparent data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 transition-all duration-200 border-none"
        >
          Mis Publicaciones ({userPostsCount})
        </TabsTrigger>
        <TabsTrigger
          value="drafts"
          className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 bg-transparent data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 transition-all duration-200 border-none"
        >
          Mis Borradores ({draftsCount})
        </TabsTrigger>
        <TabsTrigger
          value="favorites"
          className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 bg-transparent data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 transition-all duration-200 border-none"
        >
          Mis Favoritos ({favoritesCount})
        </TabsTrigger>
      </TabsList>

      <Link
        to="/publicar"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-500 lg:w-auto"
      >
        <Plus className="w-4 h-4" />
        Crear publicación
      </Link>
    </div>
  );
}
