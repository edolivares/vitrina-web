import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getPostsBySeller, updatePostStatus, getPostById, getDraftsBySeller, deletePost as apiDeletePost } from '@/api/posts';
import { mockGetChats } from '@/api/messages';
import { sileo } from 'sileo';

/**
 * Hook personalizado para unificar la gestión del perfil del usuario,
 * incluyendo sus publicaciones, borradores, chats y favoritos guardados.
 * 
 * @returns {Object} Estados de perfil, modales y manejadores de acción.
 * @returns {Object|null} user - Datos del usuario autenticado actual.
 * @returns {Array<Object>} userPosts - Publicaciones del vendedor (activas o archivadas).
 * @returns {Array<Object>} drafts - Borradores guardados del vendedor.
 * @returns {Array<Object>} favPosts - Publicaciones que el usuario tiene guardadas en favoritos.
 * @returns {Array<Object>} sellerChats - Listado de chats/salas de mensajería del vendedor.
 * @returns {boolean} loading - Estado de carga global de los datos de perfil.
 * @returns {boolean} isAvatarDialogOpen - Controla el modal de cambio de avatar.
 * @returns {Function} setIsAvatarDialogOpen - Actualiza el estado del modal del avatar.
 * @returns {boolean} isEditProfileDialogOpen - Controla el modal de edición de datos de perfil.
 * @returns {Function} setIsEditProfileDialogOpen - Actualiza el estado del modal de edición de datos.
 * @returns {boolean} isSavingProfile - Controla el estado de envío/guardado de perfil.
 * @returns {Function} setIsSavingProfile - Actualiza el estado de guardado de perfil.
 * @returns {Object|null} metricsPost - Post seleccionado para visualizar estadísticas/métricas.
 * @returns {Function} setMetricsPost - Configura el post seleccionado para las métricas.
 * @returns {Function} loadProfileData - Recarga todos los datos de perfil desde la API.
 * @returns {Function} handleUpdateStatus - Modifica el estado de una publicación (ej. ARCHIVED/PUBLISHED).
 * @returns {Function} handleDeletePost - Elimina una publicación.
 * @returns {Function} handleDeleteDraft - Elimina un borrador.
 * @returns {Function} updateUser - Actualiza los datos del usuario en memoria/localStorage.
 */
export function useProfile() {
  const { user, updateUser } = useUser();
  const { favorites } = useFavorites();

  const [userPosts, setUserPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [favPosts, setFavPosts] = useState([]);
  const [sellerChats, setSellerChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogos
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [metricsPost, setMetricsPost] = useState(null);

  /**
   * Consulta e integra en paralelo toda la información de perfil
   * (publicaciones, chats, borradores y detalles de favoritos).
   * 
   * @type {Function}
   */
  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [posts, chats, apiDrafts] = await Promise.all([
        getPostsBySeller(user.id),
        mockGetChats(user.id),
        getDraftsBySeller(user.id)
      ]);

      setUserPosts(posts);
      setSellerChats(chats);
      setDrafts(apiDrafts);

      // Carga paralela controlada de detalles de favoritos
      const favoriteDetails = [];
      for (const favId of favorites) {
        try {
          const detail = await getPostById(favId);
          favoriteDetails.push(detail);
        } catch (err) {
          console.error(`Error cargando favorito ${favId}:`, err);
        }
      }
      setFavPosts(favoriteDetails);
    } catch (error) {
      console.error('Error cargando datos de perfil:', error);
      sileo.error({
        title: 'Error de carga',
        description: 'No se pudieron cargar todos los datos de tu perfil.'
      });
    } finally {
      setLoading(false);
    }
  }, [user, favorites]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  /**
   * Actualiza el estado (archivado o activo) de una publicación.
   * 
   * @param {string} postId - UUID de la publicación.
   * @param {string} newStatus - Estado destino (ej. 'ARCHIVED', 'PUBLISHED').
   */
  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      await updatePostStatus(postId, newStatus);
      await loadProfileData();
      sileo.success({
        title: 'Publicación actualizada',
        description: newStatus === 'PUBLISHED' ? 'La publicación ha sido activada de nuevo.' : 'La publicación ha sido archivada correctamente.'
      });
    } catch (error) {
      console.error(error);
      sileo.error({ title: 'Error', description: 'No se pudo actualizar el estado de la publicación.' });
    }
  };

  /**
   * Elimina una publicación del servidor.
   * 
   * @param {string} postId - UUID de la publicación.
   */
  const handleDeletePost = async (postId) => {
    try {
      await apiDeletePost(postId);
      await loadProfileData();
      sileo.success({
        title: 'Publicación eliminada',
        description: 'La publicación ha sido eliminada con éxito.'
      });
    } catch (error) {
      console.error(error);
      sileo.error({ title: 'Error', description: 'No se pudo eliminar la publicación.' });
    }
  };

  /**
   * Elimina un borrador del servidor.
   * 
   * @param {string} draftId - UUID del borrador.
   */
  const handleDeleteDraft = async (draftId) => {
    try {
      await apiDeletePost(draftId);
      await loadProfileData();
      sileo.success({
        title: 'Borrador eliminado',
        description: 'El borrador ha sido eliminado correctamente.'
      });
    } catch (error) {
      console.error('Error al eliminar el borrador:', error);
      sileo.error({ title: 'Error', description: 'No se pudo eliminar el borrador.' });
    }
  };

  return {
    user,
    userPosts,
    drafts,
    favPosts,
    sellerChats,
    loading,
    isAvatarDialogOpen,
    setIsAvatarDialogOpen,
    isEditProfileDialogOpen,
    setIsEditProfileDialogOpen,
    isSavingProfile,
    setIsSavingProfile,
    metricsPost,
    setMetricsPost,
    loadProfileData,
    handleUpdateStatus,
    handleDeletePost,
    handleDeleteDraft,
    updateUser
  };
}
