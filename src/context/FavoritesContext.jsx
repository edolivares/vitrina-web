import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { getSavedPosts, savePost as apiSavePost, unsavePost as apiUnsavePost } from '@/api/posts';
import { sileo } from 'sileo';

/**
 * Contexto global para la gestión del listado de publicaciones favoritas (guardadas) del usuario.
 */
const FavoritesContext = createContext(null);

/**
 * Proveedor de contexto para favoritos.
 * Consume la API para cargar y sincronizar los favoritos del usuario en memoria.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos.
 * @returns {React.ReactElement} Proveedor de contexto React.
 */
export function FavoritesProvider({ children }) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      setLoading(true);
      try {
        const savedPosts = await getSavedPosts();
        setFavorites(savedPosts.map(p => String(p.id)));
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  /**
   * Alterna el estado de favoritos de una publicación (guarda o elimina según corresponda).
   * Muestra notificaciones sileo en caso de error o falta de autenticación.
   * 
   * @param {string|number} postId - ID de la publicación.
   * @returns {Promise<void>}
   */
  const toggleFavorite = async (postId) => {
    if (!user) {
      sileo.error({
        title: 'Acción requerida',
        description: 'Debes iniciar sesión para guardar publicaciones.'
      });
      return;
    }

    const idStr = String(postId);
    const isFav = favorites.includes(idStr);

    try {
      if (isFav) {
        await apiUnsavePost(idStr);
        setFavorites((prev) => prev.filter((favId) => favId !== idStr));
      } else {
        await apiSavePost(idStr);
        setFavorites((prev) => [...prev, idStr]);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      sileo.error({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar favoritos.'
      });
    }
  };

  /**
   * Comprueba si una publicación específica forma parte del listado de favoritos del usuario.
   * 
   * @param {string|number} postId - ID de la publicación a comprobar.
   * @returns {boolean} True si está guardada en favoritos.
   */
  const isFavorite = (postId) => {
    return favorites.includes(String(postId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Hook personalizado para consumir el contexto de favoritos.
 * 
 * @throws {Error} Si el hook se consume fuera de FavoritesProvider.
 * @returns {Object} Listado de favoritos y funciones expuestas (toggleFavorite, isFavorite, loading).
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe utilizarse dentro de un FavoritesProvider');
  }
  return context;
}
