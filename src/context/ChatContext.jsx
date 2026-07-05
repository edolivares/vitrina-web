import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';
import { mockGetChats } from '@/api/messages';

/**
 * Contexto para la gestión global de chats y mensajes no leídos.
 */
const ChatContext = createContext(null);

/**
 * Proveedor de contexto para la gestión de chats.
 * Administra el listado de chats del usuario, los estados de carga y calcula si existen mensajes sin leer.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos.
 * @returns {React.ReactElement} Proveedor de contexto React.
 */
export function ChatProvider({ children }) {
  const { user } = useUser();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  
  // Guardamos las marcas de tiempo de la última vez que el usuario vio un chat
  const [readChatTimestamps, setReadChatTimestamps] = useState(() => {
    try {
      const saved = localStorage.getItem('vitrina_read_chats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  /**
   * Carga los chats del usuario autenticado actual desde el servidor/mock.
   * 
   * @type {Function}
   */
  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      return;
    }
    setLoadingChats(true);
    try {
      const fetchedChats = await mockGetChats(user.id);
      setChats(fetchedChats);
    } catch (error) {
      console.error('Error cargando chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Si cambia la lista de marcas de tiempo de lectura, las guardamos localmente (opcional, para persistencia UX)
  useEffect(() => {
    if (user) {
      localStorage.setItem('vitrina_read_chats', JSON.stringify(readChatTimestamps));
    } else {
      localStorage.removeItem('vitrina_read_chats');
    }
  }, [readChatTimestamps, user]);

  /**
   * Determina si el usuario tiene al menos un mensaje no leído.
   * Se calcula contrastando las actualizaciones de los chats contra las marcas de tiempo de lectura.
   * 
   * @type {boolean}
   */
  const hasUnreadMessages = useMemo(() => {
    if (!user || chats.length === 0) return false;
    
    return chats.some((chat) => {
      // Si la última actualización del chat fue realizada por el propio usuario (él envió el último mensaje),
      // no debe considerarse como no leído para él.
      // En el mock, asumimos que si el comprador es el usuario y el último mensaje es el del sistema inicial, 
      // ya está leído porque él lo inició.
      if (chat.lastMessage === 'Conversación iniciada') {
        return false;
      }
      
      const lastRead = readChatTimestamps[chat.id];
      if (!lastRead) {
        // Si nunca lo ha abierto, es no leído
        return true;
      }
      
      return new Date(chat.updatedAt).getTime() > new Date(lastRead).getTime();
    });
  }, [chats, readChatTimestamps, user]);

  /**
   * Marca un chat específico como leído registrando la marca de tiempo actual.
   * 
   * @type {Function}
   * @param {string} chatId - UUID del chat a marcar.
   */
  const markChatAsRead = useCallback((chatId) => {
    setReadChatTimestamps((prev) => ({
      ...prev,
      [chatId]: new Date().toISOString(),
    }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        loadingChats,
        hasUnreadMessages,
        loadChats,
        markChatAsRead,
        readChatTimestamps,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook personalizado para consumir el contexto de chats.
 * 
 * @throws {Error} Si el hook se consume fuera de ChatProvider.
 * @returns {Object} Valores y métodos expuestos por ChatProvider.
 */
export function useChats() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats debe utilizarse dentro de un ChatProvider');
  }
  return context;
}
