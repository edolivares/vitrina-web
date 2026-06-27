import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { mockGetPostsBySeller, mockUpdatePostStatus, mockGetPostById } from '@/api/posts';
import { mockGetChats } from '@/api/messages';
import { Eye, Edit, Trash2, AlertCircle, Heart, FolderHeart, FileText, MessageSquare, TrendingUp, Archive, Calendar, Star, Upload, Plus, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sileo } from 'sileo';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FREE_ACCOUNT_LIMITS, STORAGE_KEYS } from '@/config/constants';
import { ConfirmAction } from '@/components/ConfirmAction';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

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

function ProfileCardsSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <Skeleton className="aspect-video rounded-none bg-slate-800" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-4/5 bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
            <Skeleton className="h-3 w-2/3 bg-slate-800" />
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-3">
              <Skeleton className="h-9 flex-1 rounded-lg bg-slate-800" />
              <Skeleton className="size-9 rounded-lg bg-slate-800" />
              <Skeleton className="size-9 rounded-lg bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getPostMetrics(post, chats = []) {
  const metricSeed = post.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const views = metricSeed + 45;
  const favorites = (metricSeed % 35) + 3;
  const productChats = chats.filter(chat => chat.postId === post.id);
  const chatCount = productChats.length;
  const conversion = views > 0 ? Math.round(((favorites + chatCount) / views) * 100) : 0;
  const weekDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const weeklyViews = weekDays.map((day, index) => {
    const dayFactor = index + 1;
    return {
      day,
      value: Math.round((views / 16) + (metricSeed * dayFactor) % 28 + dayFactor * 3)
    };
  });

  return {
    views,
    favorites,
    chatCount,
    conversion,
    weeklyViews,
    lastContact: productChats[0]?.updatedAt
  };
}

export function Profile() {
  const { user, favorites, toggleFavorite, updateUser } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = ['posts', 'drafts', 'favorites'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'posts';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [userPosts, setUserPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [favPosts, setFavPosts] = useState([]);
  const [sellerChats, setSellerChats] = useState([]);

  const [loading, setLoading] = useState(true);

  // Estados para diálogo de avatar
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [metricsPost, setMetricsPost] = useState(null);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {

      const posts = await mockGetPostsBySeller(user.id);
      setUserPosts(posts);

      const chats = await mockGetChats(user.id);
      setSellerChats(chats);

      const savedDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');
      const postSignatures = new Set(posts.map(post => `${post.title}|${post.price}|${post.images?.[0] || ''}`));
      const realDrafts = savedDrafts.filter((draft) => {
        const draftSignature = `${draft.title}|${draft.price}|${draft.images?.[0] || ''}`;

        return !draft.id?.startsWith('edit-') && !draft.sourcePostId && !postSignatures.has(draftSignature);
      });
      if (realDrafts.length !== savedDrafts.length) {
        localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(realDrafts));
      }
      setDrafts(realDrafts);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'posts' ? {} : { tab });
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      await mockUpdatePostStatus(postId, newStatus);
      loadProfileData();
      sileo.success({
        title: "Publicación actualizada",
        description: newStatus === 'PUBLISHED' ? "La publicación ha sido activada de nuevo." : "La publicación ha sido archivada correctamente."
      });
    } catch (error) {
      console.error(error);
      sileo.error({ title: "Error", description: "No se pudo actualizar el estado de la publicación." });
    }
  };

  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    sileo.success({
      title: "Borrador eliminado",
      description: "El borrador se eliminó de esta maqueta local."
    });
  };

  const handleDeletePost = (postId) => {
    try {
      const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
      const updatedPosts = posts.filter(p => p.id !== postId);
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
      loadProfileData();
      sileo.success({
        title: "Publicación eliminada",
        description: "El artículo ha sido removido de tu listado."
      });
    } catch (error) {
      console.error('Error al eliminar la publicación:', error);
      sileo.error({ title: "Error", description: "No se pudo eliminar la publicación." });
    }
  };

  const handleEditPost = (post) => {
    navigate(`/publicar?postId=${post.id}`);
  };

  // Manejadores de Drag and Drop para el Avatar
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      sileo.error({
        title: "Archivo no soportado",
        description: "Por favor, selecciona un archivo de imagen válido (PNG, JPG o WEBP)."
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSaveAvatar = () => {
    if (previewUrl) {
      updateUser({ avatarUrl: previewUrl });
      setIsAvatarDialogOpen(false);
      setPreviewUrl(null);
      sileo.success({
        title: "¡Avatar actualizado!",
        description: "Tu foto de perfil se ha guardado correctamente."
      });
    }
  };

  const handleOpenEditProfile = () => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setIsEditProfileDialogOpen(true);
  };

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    updateUser({ name: profileName, email: profileEmail });
    sileo.success({
      title: "Perfil actualizado",
      description: "Los datos se guardaron en la maqueta local."
    });
    setTimeout(() => {
      setIsSavingProfile(false);
      setIsEditProfileDialogOpen(false);
    }, 900);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);
  };



  if (!user) return null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <Helmet>
        <title>Mi Perfil | Vitrina</title>
        <meta name="description" content="Gestiona tu cuenta, tus publicaciones activas, tus borradores y tus productos favoritos en Vitrina." />
      </Helmet>

      {/* User Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 flex-1 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="w-20 h-20 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/5">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xl bg-slate-800 text-slate-200 font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => {
                setPreviewUrl(null);
                setIsAvatarDialogOpen(true);
              }}
              className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border border-slate-900 transition-all hover:scale-105 shadow-md flex items-center justify-center cursor-pointer"
              title="Cambiar foto de perfil"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left flex flex-col gap-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">{user.name}</h2>
            <span className="text-sm font-medium text-slate-400">{user.email}</span>
            
            {/* Insignias/Badges de usuario */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 border border-slate-800/80 rounded-full text-xs font-semibold text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Registrado: 12 Mayo 2024</span>
              </div>
              <div className="flex items-center px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
                <span>Usuario Verificado</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 border border-slate-800/80 rounded-full text-xs font-semibold text-slate-300">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span>4.9 (124 reseñas)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={handleOpenEditProfile}
            className="w-full md:w-auto px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:border-slate-700 active:scale-98 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Editar Perfil
          </button>
        </div>
      </div>

      {}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="bg-slate-900 border border-slate-800/80 p-1.5 rounded-2xl flex gap-2 w-full max-w-xl justify-start h-auto">
            <TabsTrigger
              value="posts"
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 bg-transparent data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 transition-all duration-200 border-none"
            >
              Mis Publicaciones ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 bg-transparent data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 transition-all duration-200 border-none"
            >
              Mis Borradores ({drafts.length})
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 bg-transparent data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 transition-all duration-200 border-none"
            >
              Mis Favoritos ({favPosts.length})
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

        {}
        {loading ? (
          <div className="flex flex-col gap-4">
            <span className="sr-only">Cargando información del perfil...</span>
            <ProfileCardsSkeleton />
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {}
            <TabsContent value="posts" className="mt-0 outline-none">
              {userPosts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
                  <FileText className="w-8 h-8 text-slate-700" />
                  <span className="text-sm font-medium">Aún no has creado publicaciones</span>
                  <Link to="/publicar" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1">Crear mi primera publicación</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {userPosts.map(post => (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                      {(() => {
                        const metrics = getPostMetrics(post, sellerChats);

                        return (
                          <>
                      {/* Area de Imagen */}
                      <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                        <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                        
                        {/* Estado Badge (Top Left) */}
                        <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm tracking-wider uppercase border-none ${
                          post.status === 'PUBLISHED'
                            ? 'bg-indigo-600/90'
                            : post.status === 'SOLD'
                            ? 'bg-blue-600/90'
                            : 'bg-slate-800/90 text-slate-300'
                        }`}>
                          {post.status === 'PUBLISHED' ? 'Publicada' : post.status === 'SOLD' ? 'Vendida' : 'Archivada'}
                        </span>

                        {/* Contador de vistas (Top Right) */}
                        <div className="absolute top-3 right-3 bg-slate-950/60 border border-slate-800/80 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{metrics.views}</span>
                        </div>
                      </div>

                      {/* Informacion */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-bold text-slate-200 truncate">{post.title}</h3>
                          <span className="text-sm font-semibold text-indigo-400">{formatPrice(post.price)}</span>
                          <span className="text-[10px] text-slate-500">Actualizado: hace unos momentos</span>
                        </div>

                        {/* Botones de accion */}
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-1">
                          {/* 1. Chats de esta publicacion */}
                          <Link
                            to={`/mensajes/publicacion/${post.id}`}
                            className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-250"
                            title="Ver mensajes de esta publicaciÃ³n"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Link>

                          {/* 2. Editar */}
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-250"
                            title="Editar publicación"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* 3. Archivar / Activar */}
                          {post.status === 'PUBLISHED' ? (
                            <ConfirmAction
                              title="Archivar publicación"
                              description="La publicación dejará de estar disponible para compradores, pero podrás restaurarla desde tu perfil."
                              actionLabel="Archivar"
                              onConfirm={() => handleUpdateStatus(post.id, 'ARCHIVED')}
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
                              onConfirm={() => handleUpdateStatus(post.id, 'PUBLISHED')}
                            >
                              <button
                                className="p-2 rounded-lg bg-slate-950 text-emerald-500/80 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-250"
                                title="Publicar de nuevo"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </ConfirmAction>
                          )}

                          {/* 4. Estadísticas */}
                          <button
                            onClick={() => setMetricsPost(post)}
                            className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-250"
                            title="Estadísticas"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* 5. Eliminar */}
                          <ConfirmAction
                            title="Eliminar publicación"
                            description="Esta acción quitará la publicación de tu listado mock. Puedes volver a crearla desde el formulario de publicación."
                            actionLabel="Eliminar"
                            onConfirm={() => handleDeletePost(post.id)}
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
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {}
            <TabsContent value="drafts" className="mt-0 outline-none">
              <div className="flex flex-col gap-4">
                {}
                <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 p-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Borradores activos: <strong>{drafts.length} de {FREE_ACCOUNT_LIMITS.MAX_DRAFTS}</strong>. Los borradores te permiten guardar artículos incompletos para publicarlos después.</span>
                </div>

                <div>
                  {drafts.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-800/80 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-700" />
                      <span className="text-sm font-medium">No tienes borradores pendientes</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {drafts.map(draft => (
                        <div key={draft.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                          <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                            {draft.images?.[0] ? (
                              <img src={draft.images[0]} alt={draft.title || 'Borrador sin título'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
                                <FileText className="w-8 h-8" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Sin imagen</span>
                              </div>
                            )}

                            <span className="absolute top-3 left-3 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950 backdrop-blur-sm">
                              Borrador
                            </span>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-bold text-slate-200 truncate">{draft.title || 'Sin título'}</h3>
                              <span className="text-sm font-semibold text-indigo-400">{formatPrice(draft.price || 0)}</span>
                              <span className="text-[10px] text-slate-500">
                                {draft.comuna ? `Ubicación: ${draft.comuna}` : 'Ubicación pendiente'}
                              </span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                              <button
                                onClick={() => navigate(`/publicar?draftId=${draft.id}`)}
                                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Continuar
                              </button>
                              <ConfirmAction
                                title="Eliminar borrador"
                                description="El borrador se eliminará de esta maqueta local y liberará uno de los 5 cupos disponibles."
                                actionLabel="Eliminar"
                                onConfirm={() => handleDeleteDraft(draft.id)}
                              >
                                <button
                                  className="p-2 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Eliminar borrador"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </ConfirmAction>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {}
            <TabsContent value="favorites" className="mt-0 outline-none">
              {favPosts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center justify-center gap-2">
                  <FolderHeart className="w-8 h-8 text-slate-700" />
                  <span className="text-sm font-medium">No tienes publicaciones guardadas como favoritas</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {favPosts.map(post => (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                      {/* Area de Imagen */}
                      <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                        <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                        
                        {/* Disponibilidad para el comprador */}
                        <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm tracking-wider uppercase border-none ${
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-600/90'
                            : post.status === 'SOLD'
                            ? 'bg-blue-600/90'
                            : 'bg-slate-800/90 text-slate-300'
                        }`}>
                          {post.status === 'PUBLISHED' ? 'Disponible' : post.status === 'SOLD' ? 'Vendido' : 'No disponible'}
                        </span>

                        <span className="absolute top-3 right-3 rounded bg-slate-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 backdrop-blur-sm">
                          {post.condition || 'Usado'}
                        </span>
                      </div>

                      {/* Informacion */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-bold text-slate-200 truncate">{post.title}</h3>
                          <span className="text-sm font-semibold text-indigo-400">{formatPrice(post.price)}</span>
                          <span className="text-[10px] text-slate-500">Ubicación: {post.comuna} · Condición: {post.condition || 'Usado'}</span>
                        </div>

                        {/* Botones de accion */}
                        <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between gap-2">
                          <Link
                            to={`/publicacion/${post.id}`}
                            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Artículo
                          </Link>
                          
                          <button
                            onClick={() => toggleFavorite(post.id)}
                            className="p-2 rounded-lg bg-slate-950 text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Quitar de favoritos"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

          </div>
        )}
      </Tabs>

      <Dialog open={isEditProfileDialogOpen} onOpenChange={(open) => !isSavingProfile && setIsEditProfileDialogOpen(open)}>
        <DialogContent className="max-w-md overflow-hidden bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl">
          {isSavingProfile && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/55 text-slate-100 backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-indigo-300" />
              <span className="text-sm font-semibold">Guardando perfil...</span>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-100">Editar Perfil</DialogTitle>
            <DialogDescription className="text-sm text-slate-400 mt-1">
              Actualiza los datos visibles de tu cuenta en esta maqueta local.
            </DialogDescription>
          </DialogHeader>

          <fieldset disabled={isSavingProfile} className="flex flex-col gap-4 py-4 disabled:opacity-75">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Nombre</label>
              <Input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                className="rounded-xl border-slate-800 bg-slate-950 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Correo electrónico</label>
              <Input
                value={profileEmail}
                onChange={(event) => setProfileEmail(event.target.value)}
                className="rounded-xl border-slate-800 bg-slate-950 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-0"
              />
            </div>
          </fieldset>

          <DialogFooter className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsEditProfileDialogOpen(false)}
              disabled={isSavingProfile}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(metricsPost)} onOpenChange={(open) => !open && setMetricsPost(null)}>
        <DialogContent className="max-h-[90vh] w-[min(92vw,920px)] max-w-none overflow-y-auto bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl sm:max-w-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-100">Métricas de publicación</DialogTitle>
            <DialogDescription className="text-sm text-slate-400 mt-1">
              Datos simulados para presentar el flujo de dashboard del vendedor.
            </DialogDescription>
          </DialogHeader>

          {metricsPost && (() => {
            const metrics = getPostMetrics(metricsPost, sellerChats);
            const maxWeekValue = Math.max(...metrics.weeklyViews.map(day => day.value));

            return (
              <div className="flex flex-col gap-5 py-4">
                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
                  <img
                    src={metricsPost.images[0]}
                    alt={metricsPost.title}
                    className="h-32 w-full rounded-xl object-cover md:h-28"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Publicacion</span>
                    <h3 className="text-lg font-bold leading-snug text-slate-100">{metricsPost.title}</h3>
                    <span className="text-sm font-semibold text-indigo-300">{formatPrice(metricsPost.price)}</span>
                  </div>
                  <Link
                    to={`/mensajes/publicacion/${metricsPost.id}`}
                    onClick={() => setMetricsPost(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 md:w-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ver mensajes
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="block text-xl font-bold text-slate-100">{metrics.views}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Visitas</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="block text-xl font-bold text-slate-100">{metrics.favorites}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Favoritos</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="block text-xl font-bold text-slate-100">{metrics.chatCount}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Conversaciones</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="block text-xl font-bold text-slate-100">{metrics.conversion}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Interes estimado</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">Visitas de la semana</h4>
                        <p className="text-xs text-slate-500">Distribucion simulada para comparar dias.</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div className="flex flex-col gap-3">
                      {metrics.weeklyViews.map((dayMetric) => (
                        <div key={dayMetric.day} className="grid grid-cols-[72px_minmax(0,1fr)_48px] items-center gap-3">
                          <span className="text-xs font-medium text-slate-400">{dayMetric.day}</span>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${Math.max(10, (dayMetric.value / maxWeekValue) * 100)}%` }}
                            />
                          </div>
                          <span className="text-right text-xs font-semibold text-slate-200">{dayMetric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <h4 className="text-sm font-bold text-slate-100">Resumen</h4>
                    <div className="mt-4 flex flex-col gap-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
                        <span className="text-slate-500">Estado</span>
                        <span className="font-semibold text-slate-200">
                          {metricsPost.status === 'PUBLISHED' ? 'Publicada' : metricsPost.status === 'SOLD' ? 'Vendida' : 'Archivada'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
                        <span className="text-slate-500">Ubicacion</span>
                        <span className="font-semibold text-slate-200">{metricsPost.comuna}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
                        <span className="text-slate-500">Ultimo contacto</span>
                        <span className="font-semibold text-slate-200">
                          {metrics.lastContact ? new Date(metrics.lastContact).toLocaleDateString('es-CL') : 'Sin mensajes'}
                        </span>
                      </div>
                      <p className="rounded-xl bg-indigo-500/10 p-3 text-indigo-200">
                        {metrics.chatCount > 0
                          ? 'Esta publicacion ya tiene conversaciones asociadas. Conviene responder desde la vista de mensajes filtrada.'
                          : 'Aun no hay conversaciones para esta publicacion. Las visitas y favoritos ayudan a estimar interes inicial.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Cambio de Imagen */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-100">Cambiar Foto de Perfil</DialogTitle>
            <DialogDescription className="text-sm text-slate-400 mt-1">
              Arrastra una nueva foto o haz clic en la zona para seleccionarla desde tu equipo.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            {/* Zona de Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('avatar-input').click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Previsualización"
                    className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg"
                  />
                  <span className="text-xs text-indigo-400 font-semibold">Previsualización del avatar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-200">Arrastra tu imagen aquí</span>
                    <span className="text-xs text-slate-500">O haz clic para buscar archivo</span>
                  </div>
                  <span className="text-[10px] text-slate-600">Soporta PNG, JPG o WEBP (máx. 5MB)</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setIsAvatarDialogOpen(false);
                setPreviewUrl(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAvatar}
              disabled={!previewUrl}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md ${
                previewUrl
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              Guardar Cambios
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
