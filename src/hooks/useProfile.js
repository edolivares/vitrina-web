import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getPostsBySeller, updatePostStatus, getPostById, getDraftsBySeller, deletePost as apiDeletePost, getPublicProfile } from '@/api/posts';
import { getChats } from '@/api/messages';
import { uploadAvatar } from '@/api/auth';
import { sileo } from 'sileo';

const EMPTY_REVIEW_DATA = {
  score: 0,
  count: 0,
  summary: [],
  reviews: [],
};

const cropAvatarToSquare = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = Math.floor((image.naturalWidth - sourceSize) / 2);
      const sourceY = Math.floor((image.naturalHeight - sourceSize) / 2);
      const outputSize = 512;
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;

      canvas.getContext('2d').drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('No se pudo procesar la imagen.'));
            return;
          }

          resolve({
            file: new File([blob], 'avatar.jpg', { type: 'image/jpeg' }),
            previewUrl: canvas.toDataURL('image/jpeg', 0.9),
          });
        },
        'image/jpeg',
        0.9
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };

    image.src = objectUrl;
  });

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
  const [reviewData, setReviewData] = useState(EMPTY_REVIEW_DATA);
  const [loading, setLoading] = useState(true);

  // Estados para diálogos
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileName, setProfileName] = useState(() => user?.name || '');
  const [profileEmail, setProfileEmail] = useState(() => user?.email || '');
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isAvatarDragActive, setIsAvatarDragActive] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
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
      const [posts, chats, apiDrafts, publicProfile] = await Promise.all([
        getPostsBySeller(user.id),
        getChats(),
        getDraftsBySeller(user.id),
        getPublicProfile(user.id),
      ]);

      setUserPosts(posts);
      setSellerChats(chats);
      setDrafts(apiDrafts);
      setReviewData({
        score: publicProfile.profile.reviewScore,
        count: publicProfile.profile.reviewCount,
        summary: publicProfile.profile.reviewSummary,
        reviews: publicProfile.profile.reviews,
      });

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleOpenAvatarDialog = () => {
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
    setIsAvatarDialogOpen(true);
  };

  const processAvatarFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      sileo.error({
        title: 'Archivo no soportado',
        description: 'Por favor, selecciona un archivo de imagen válido (PNG, JPG o WEBP).',
      });
      return;
    }

    try {
      const croppedAvatar = await cropAvatarToSquare(file);
      setAvatarPreviewUrl(croppedAvatar.previewUrl);
      setAvatarFile(croppedAvatar.file);
    } catch (error) {
      sileo.error({
        title: 'No se pudo preparar la imagen',
        description: error.message || 'Intenta nuevamente con otra imagen.',
      });
    }
  };

  const handleAvatarDragOver = (event) => {
    event.preventDefault();
    setIsAvatarDragActive(true);
  };

  const handleAvatarDragLeave = (event) => {
    event.preventDefault();
    setIsAvatarDragActive(false);
  };

  const handleAvatarDrop = (event) => {
    event.preventDefault();
    setIsAvatarDragActive(false);
    if (event.dataTransfer.files?.[0]) {
      processAvatarFile(event.dataTransfer.files[0]);
    }
  };

  const handleAvatarFileSelect = (event) => {
    if (event.target.files?.[0]) {
      processAvatarFile(event.target.files[0]);
    }
    event.target.value = '';
  };

  const handleCancelAvatar = () => {
    setIsAvatarDialogOpen(false);
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;

    setIsSavingAvatar(true);
    try {
      const updatedUser = await uploadAvatar(avatarFile);
      updateUser(updatedUser);
      handleCancelAvatar();
      sileo.success({
        title: '¡Avatar actualizado!',
        description: 'Tu foto de perfil se ha guardado correctamente.',
      });
    } catch (error) {
      sileo.error({
        title: 'No se pudo guardar el avatar',
        description: error.message || 'Intenta nuevamente con otra imagen.',
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
    setIsEditProfileDialogOpen(true);
  };

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    updateUser({ name: profileName, email: profileEmail });
    sileo.success({
      title: 'Perfil actualizado',
      description: 'Los datos se guardaron en la maqueta local.',
    });
    setTimeout(() => {
      setIsSavingProfile(false);
      setIsEditProfileDialogOpen(false);
    }, 900);
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
    avatarPreviewUrl,
    isAvatarDragActive,
    isSavingAvatar,
    isEditProfileDialogOpen,
    setIsEditProfileDialogOpen,
    isSavingProfile,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    isReviewsOpen,
    setIsReviewsOpen,
    reviewData,
    metricsPost,
    setMetricsPost,
    loadProfileData,
    handleUpdateStatus,
    handleDeletePost,
    handleDeleteDraft,
    handleOpenAvatarDialog,
    handleAvatarDragOver,
    handleAvatarDragLeave,
    handleAvatarDrop,
    handleAvatarFileSelect,
    handleCancelAvatar,
    handleSaveAvatar,
    handleOpenEditProfile,
    handleSaveProfile,
  };
}
