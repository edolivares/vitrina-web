/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';
import { getChats, mapChatResponse, markChatAsRead as apiMarkChatAsRead } from '@/api/messages';
import { disconnectPusher, getPusherClient, userChannelName } from '@/lib/realtime';

/**
 * Contexto para la gestión global de chats y mensajes no leídos.
 */
const ChatContext = createContext(null);

const sortChatsByLastMessage = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b.lastMessageAt || b.updatedAt || 0).getTime() -
      new Date(a.lastMessageAt || a.updatedAt || 0).getTime()
  );

const upsertChat = (items, chat) => {
  const normalizedChat = mapChatResponse(chat);
  if (!normalizedChat) return items;

  const exists = items.some((item) => item.id === normalizedChat.id);
  const next = exists
    ? items.map((item) => (item.id === normalizedChat.id ? normalizedChat : item))
    : [normalizedChat, ...items];

  return sortChatsByLastMessage(next);
};

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
  const [lastChatEvent, setLastChatEvent] = useState(null);


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
      const fetchedChats = await getChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error('Error cargando chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!user) {
      disconnectPusher();
      return undefined;
    }

    const pusher = getPusherClient();
    if (!pusher) return undefined;

    const channelName = userChannelName(user.id);
    const channel = pusher.subscribe(channelName);
    const handleChatCreated = ({ chat }) => {
      setChats((prevChats) => upsertChat(prevChats, chat));
      const normalizedChat = mapChatResponse(chat);
      if (normalizedChat) {
        setLastChatEvent({
          type: 'created',
          chat: normalizedChat,
          receivedAt: Date.now(),
        });
      }
    };

    const handleChatUpdated = ({ chat }) => {
      setChats((prevChats) => upsertChat(prevChats, chat));
    };

    channel.bind('chat.created', handleChatCreated);
    channel.bind('chat.updated', handleChatUpdated);

    return () => {
      channel.unbind('chat.created', handleChatCreated);
      channel.unbind('chat.updated', handleChatUpdated);
      pusher.unsubscribe(channelName);
    };
  }, [user]);

  /**
   * Determina si el usuario tiene al menos un mensaje no leído.
   * Se calcula contrastando las actualizaciones de los chats contra las marcas de tiempo de lectura.
   * 
   * @type {boolean}
   */
  const hasUnreadMessages = useMemo(() => {
    if (!user || chats.length === 0) return false;
    return chats.some((chat) => chat.isUnread);
  }, [chats, user]);

  /**
   * Marca un chat específico como leído en el servidor y actualiza el estado local.
   * 
   * @type {Function}
   * @param {string} chatId - UUID del chat a marcar.
   */
  const markChatAsRead = useCallback(async (chatId) => {
    try {
      await apiMarkChatAsRead(chatId);
      setChats((prevChats) =>
        prevChats.map((c) => (c.id === chatId ? { ...c, isUnread: false } : c))
      );
    } catch (error) {
      console.error('Error al marcar chat como leído:', error);
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        loadingChats,
        hasUnreadMessages,
        lastChatEvent,
        loadChats,
        markChatAsRead,
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
