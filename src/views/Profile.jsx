import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { mockGetPostsBySeller, mockUpdatePostStatus, mockGetPostById } from '@/api/posts';
import { Eye, Edit, Trash2, CheckCircle, Pause, Play, AlertCircle, Heart, FolderHeart, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { STORAGE_KEYS } from '@/config/constants';

const INITIAL_DRAFTS = [
  {
    id: 'draft-1',
    title: 'Estante de libros melamina blanca',
    price: 35000,
    description: 'Estante de libros de melamina de 15mm de espesor. Color blanco mate. Medidas aproximadas: 180cm de alto x 60cm de ancho x 30cm de fondo. Tiene 5 repisas.',
    region: 'Región Metropolitana',
    comuna: 'Santiago',
    images: []
  }
];

if (!localStorage.getItem(STORAGE_KEYS.DRAFTS)) {
  localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(INITIAL_DRAFTS));
}

export function Profile() {
  const { user, favorites, toggleFavorite } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');

  const [userPosts, setUserPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [favPosts, setFavPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {

      const posts = await mockGetPostsBySeller(user.id);
      setUserPosts(posts);

      const savedDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');
      setDrafts(savedDrafts);

      const favoriteDetails = [];
      for (const favId of favorites) {
        try {
          const detail = await mockGetPostById(favId);
          favoriteDetails.push(detail);
        } catch (err) {
          console.error(`Error cargando favorito ${favId}:`, err);
        }
      }
      setFavPosts(favoriteDetails);

    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  }, [user, favorites]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadProfileData();
    });
  }, [loadProfileData, activeTab]);

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      await mockUpdatePostStatus(postId, newStatus);
      loadProfileData();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el estado de la publicación');
    }
  };

  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">Publicada</span>;
      case 'ARCHIVED':
        return <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">Archivada</span>;
      case 'SOLD':
        return <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">Vendida</span>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 w-full p-6 flex flex-col gap-8">
      <Helmet>
        <title>Mi Perfil | Vitrina</title>
        <meta name="description" content="Gestiona tu cuenta, tus publicaciones activas, tus borradores y tus productos favoritos en Vitrina." />
      </Helmet>

      {}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center gap-6">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
        />
        <div className="flex-1 text-center md:text-left flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">{user.name}</h1>
          <p className="text-xs text-slate-400">{user.email}</p>
          <span className="text-[10px] text-slate-600 mt-1">Miembro desde: Junio 2026</span>
        </div>
      </div>

      {}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
        <TabsList className="bg-transparent border-b border-slate-800/80 rounded-none w-full justify-start p-0 h-auto gap-2">
          <TabsTrigger
            value="posts"
            className="pb-3 px-4 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 bg-transparent hover:text-slate-200 transition-all duration-300"
          >
            Mis Publicaciones ({userPosts.length})
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className="pb-3 px-4 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 bg-transparent hover:text-slate-200 transition-all duration-300"
          >
            Mis Borradores ({drafts.length})
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="pb-3 px-4 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 bg-transparent hover:text-slate-200 transition-all duration-300"
          >
            Mis Favoritos ({favPosts.length})
          </TabsTrigger>
        </TabsList>

        {}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">Cargando información del perfil...</div>
        ) : (
          <div className="flex flex-col gap-4">

            {}
            <TabsContent value="posts" className="mt-0 outline-none">
              <div className="flex flex-col gap-3">
                {userPosts.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-slate-800/80 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-700" />
                    <span className="text-sm font-medium">Aún no has creado publicaciones</span>
                    <Link to="/publicar" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1">Crear mi primera publicación</Link>
                  </div>
                ) : (
                  userPosts.map(post => (
                    <div key={post.id} className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img src={post.images[0]} alt={post.title} className="w-14 h-14 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-sm font-bold text-slate-200 truncate">{post.title}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold text-indigo-400">{formatPrice(post.price)}</span>
                            {getStatusBadge(post.status)}
                          </div>
                        </div>
                      </div>
                      {}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {post.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => handleUpdateStatus(post.id, 'ARCHIVED')}
                            className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Pausar / Archivar publicación"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : post.status === 'ARCHIVED' ? (
                          <button
                            onClick={() => handleUpdateStatus(post.id, 'PUBLISHED')}
                            className="p-2 rounded-lg bg-slate-950 text-emerald-500/80 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Activar / Publicar"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : null}

                        {post.status !== 'SOLD' && (
                          <button
                            onClick={() => handleUpdateStatus(post.id, 'SOLD')}
                            className="p-2 rounded-lg bg-slate-950 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                            title="Marcar como Vendido"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <Link
                          to={`/publicacion/${post.id}`}
                          className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {}
            <TabsContent value="drafts" className="mt-0 outline-none">
              <div className="flex flex-col gap-4">
                {}
                <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 p-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Borradores activos: <strong>{drafts.length} de 5</strong>. Los borradores te permiten guardar artículos incompletos para publicarlos después.</span>
                </div>

                <div className="flex flex-col gap-3">
                  {drafts.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-800/80 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-700" />
                      <span className="text-sm font-medium">No tienes borradores pendientes</span>
                    </div>
                  ) : (
                    drafts.map(draft => (
                      <div key={draft.id} className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-sm font-bold text-slate-200 truncate">{draft.title || 'Sin Título'}</span>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Precio: {formatPrice(draft.price)}</span>
                            <span>Comuna: {draft.comuna}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/publicar?draftId=${draft.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Continuar
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="p-2 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar borrador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {}
            <TabsContent value="favorites" className="mt-0 outline-none">
              <div className="flex flex-col gap-3">
                {favPosts.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-slate-800/80 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
                    <FolderHeart className="w-8 h-8 text-slate-700" />
                    <span className="text-sm font-medium">No tienes publicaciones guardadas como favoritas</span>
                  </div>
                ) : (
                  favPosts.map(post => (
                    <div key={post.id} className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <img src={post.images[0]} alt={post.title} className="w-12 h-12 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                        <div className="flex flex-col gap-1 min-w-0">
                          <Link to={`/publicacion/${post.id}`} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors truncate">{post.title}</Link>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-indigo-400">{formatPrice(post.price)}</span>
                            <span>Ubicación: {post.comuna}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(post.id)}
                          className="p-2 rounded-lg bg-slate-950 text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Quitar de favoritos"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

          </div>
        )}
      </Tabs>

    </div>
  );
}
