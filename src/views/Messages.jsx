import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@/context/UserContext';
import { useChats } from '@/context/ChatContext';
import { getMessages, mapMessageResponse, sendMessage } from '@/api/messages';
import { chatChannelName, getPusherClient } from '@/lib/realtime';
import { sileo } from 'sileo';
import { formatPrice, formatTime } from '@/lib/format';

export function Messages() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { chatId: routeChatId, postId: routePostId } = useParams();
  const [searchParams] = useSearchParams();
  const legacyChatId = searchParams.get('chatId');
  const activeChatId = routeChatId || legacyChatId;
  const legacyPostId = searchParams.get('postId');
  const activePostId = routePostId || searchParams.get('post');

  const { chats, loadingChats, loadChats, markChatAsRead } = useChats();
  const [messages, setMessages] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const activeChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentAtRef = useRef(0);

  const visibleChats = useMemo(() => {
    if (activePostId) {
      return chats.filter(chat => chat.postId === activePostId);
    }

    if (legacyPostId) {
      return chats.filter(chat => chat.postId === legacyPostId);
    }

    return chats;
  }, [activePostId, chats, legacyPostId]);

  const activeChat = useMemo(() => {
    if (!activeChatId) return null;

    return visibleChats.find(chat => chat.id === activeChatId) || null;
  }, [activeChatId, visibleChats]);



  useEffect(() => {
    if (!legacyChatId || routeChatId) return;

    const suffix = activePostId ? `?post=${activePostId}` : '';
    navigate(`/mensajes/${legacyChatId}${suffix}`, { replace: true });
  }, [activePostId, legacyChatId, navigate, routeChatId]);

  useEffect(() => {
    if (activeChatId && !chats.some(c => c.id === activeChatId)) {
      loadChats();
    }
  }, [activeChatId, chats, loadChats]);

  useEffect(() => {
    async function loadMessages() {
      const chatExists = chats.some(c => c.id === activeChatId);
      if (!activeChatId || !chatExists) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        const fetchedMessages = await getMessages(activeChatId);
        setMessages(fetchedMessages);
        markChatAsRead(activeChatId);

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [activeChatId, chats.length > 0, markChatAsRead]);

  useEffect(() => {
    if (!activeChatId || !user) return undefined;

    const pusher = getPusherClient();
    if (!pusher) return undefined;

    const channelName = chatChannelName(activeChatId);
    const channel = pusher.subscribe(channelName);
    activeChannelRef.current = channel;

    const handleMessageCreated = ({ message }) => {
      const nextMessage = mapMessageResponse(message);
      if (!nextMessage) return;

      setMessages((prevMessages) => {
        if (prevMessages.some((item) => item.id === nextMessage.id)) return prevMessages;
        return [...prevMessages, nextMessage];
      });

      if (nextMessage.sender !== user.id) {
        setTypingUser(null);
        markChatAsRead(activeChatId);
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    const handleTyping = ({ userId, name }) => {
      if (!userId || userId === user.id) return;

      setTypingUser(name || 'La otra persona');
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        setTypingUser(null);
      }, 2500);
    };

    channel.bind('message.created', handleMessageCreated);
    channel.bind('client-typing', handleTyping);

    return () => {
      channel.unbind('message.created', handleMessageCreated);
      channel.unbind('client-typing', handleTyping);
      pusher.unsubscribe(channelName);
      activeChannelRef.current = null;
      window.clearTimeout(typingTimeoutRef.current);
      setTypingUser(null);
    };
  }, [activeChatId, markChatAsRead, user]);

  const notifyTyping = useCallback(() => {
    const channel = activeChannelRef.current;
    const now = Date.now();
    if (!channel || !activeChatId || !user || now - lastTypingSentAtRef.current < 1200) return;

    lastTypingSentAtRef.current = now;
    try {
      channel.trigger('client-typing', {
        userId: user.id,
        name: user.name,
        chatId: activeChatId,
      });
    } catch (error) {
      console.warn('No se pudo enviar indicador de escritura:', error.message);
    }
  }, [activeChatId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatId || !user) return;

    setSending(true);
    const content = newMessageText.trim();
    setNewMessageText('');

    try {
      const sentMsg = await sendMessage(activeChatId, content);
      setMessages(prev => [...prev, sentMsg]);

      await loadChats();

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch {
      sileo.error({
        title: 'No se pudo enviar el mensaje',
        description: 'Intenta nuevamente en unos segundos.'
      });
    } finally {
      setSending(false);
    }
  };

  const handleMessageInputChange = (e) => {
    setNewMessageText(e.target.value);
    if (e.target.value.trim()) {
      notifyTyping();
    }
  };

  const selectChat = (chatId) => {
    navigate(activePostId ? `/mensajes/${chatId}?post=${activePostId}` : `/mensajes/${chatId}`);
  };

  const getOtherParticipantName = (chat) => {
    return chat.seller === user.id ? chat.buyerName : chat.sellerName;
  };

  const unreadChatsCount = visibleChats.filter((chat) => chat.isUnread).length;

  if (!user) return null;

  return (
    <div className="flex h-[calc(100dvh-76px)] max-h-[calc(100dvh-76px)] min-h-0 w-full flex-1 gap-6 overflow-hidden px-4 pb-1 pt-4">
      <Helmet>
        <title>Mis Mensajes | Vitrina</title>
        <meta name="description" content="Conversa directamente con compradores y vendedores sobre tus artículos de manera privada y segura." />
      </Helmet>

      <div className={`min-h-0 w-full md:w-80 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            {activePostId || legacyPostId ? 'Mensajes del producto' : 'Mensajes'}
            {unreadChatsCount > 0 && (
              <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-indigo-500/30">
                {unreadChatsCount}
              </span>
            )}
          </h2>
          {(activePostId || legacyPostId) && (
            <button
              type="button"
              onClick={() => navigate('/mensajes')}
              className="mt-2 text-xs font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
            >
              Ver todas las conversaciones
            </button>
          )}
        </div>

        {loadingChats ? (
          <div className="flex min-h-0 flex-1 justify-center items-center text-slate-500 text-xs">Cargando bandeja...</div>
        ) : visibleChats.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col justify-center items-center p-6 text-center text-slate-500 gap-2">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <span className="text-xs">
              {activePostId || legacyPostId ? 'No hay conversaciones para esta publicacion' : 'No tienes conversaciones activas'}
            </span>
          </div>
        ) : (
          <div className="chat-scrollbar min-h-0 flex-1 basis-0 overflow-y-auto">
            <div className="pr-2">
              {visibleChats.map(chat => {
              const isActive = chat.id === activeChatId;
              const isUnread = Boolean(chat.isUnread);
              const otherName = getOtherParticipantName(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  aria-label={isUnread ? `${otherName}, conversación con mensajes pendientes` : otherName}
                  className={`relative w-full border-b border-slate-800 p-4 flex items-center gap-3 text-left transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-100 border-l-4 border-l-indigo-500 pl-3'
                      : isUnread
                      ? 'border-l-4 border-l-indigo-400 bg-indigo-500/10 pl-3 hover:bg-indigo-500/15'
                      : 'hover:bg-slate-800/40 pl-4'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.postImage}
                      alt={chat.postTitle}
                      className={`w-12 h-12 rounded-lg object-cover bg-slate-950 ${
                        isUnread ? 'ring-2 ring-indigo-400/70' : ''
                      }`}
                    />
                    {isUnread && (
                      <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-slate-900 bg-indigo-400 shadow-sm shadow-indigo-500/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className={`truncate text-xs ${isUnread ? 'font-bold text-slate-50' : 'font-semibold text-slate-300'}`}>
                        {otherName}
                      </span>
                      <span className={`text-[9px] ${isUnread ? 'font-semibold text-indigo-300' : 'text-slate-500'}`}>
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <span className={`truncate text-[11px] font-medium ${isUnread ? 'text-slate-200' : 'text-slate-400'}`}>
                      {chat.postTitle}
                    </span>
                    <span className={`mt-0.5 truncate text-[10px] ${isUnread ? 'font-semibold text-slate-300' : 'text-slate-500'}`}>
                      {chat.lastMessage}
                    </span>
                  </div>
                </button>
              );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={`min-h-0 flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        activeChatId ? 'flex' : 'hidden md:flex'
      }`}>

        {activeChatId && activeChat ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/40">

              <button
                onClick={() => navigate(activePostId ? `/mensajes/publicacion/${activePostId}` : '/mensajes')}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 md:hidden transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0 flex items-center gap-3">
                <img src={activeChat.postImage} alt={activeChat.postTitle} className="w-10 h-10 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <Link
                    to={`/perfil/${activeChat.seller === user.id ? activeChat.buyer : activeChat.seller}`}
                    className="text-xs font-bold text-slate-200 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    {getOtherParticipantName(activeChat)}
                  </Link>
                  <Link to={`/publicacion/${activeChat.postId}`} className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 mt-0.5 truncate">
                    <span>{activeChat.postTitle}</span>
                    <span className="font-semibold text-indigo-400">{formatPrice(activeChat.postPrice)}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="chat-scrollbar min-h-0 flex-1 basis-0 overflow-y-auto overscroll-contain">
              {loadingMessages ? (
                <div className="flex-1 flex justify-center items-center text-slate-500 text-xs">Cargando mensajes...</div>
              ) : (
                <div className="flex min-h-full flex-col gap-3 px-4 py-3 pr-6">
                  {messages.map(msg => {
                    const isMe = msg.sender === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[75%] ${
                          isMe ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 pl-1 pr-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                  {typingUser && (
                    <div className="self-start text-[10px] font-medium text-slate-500 px-1">
                      {typingUser} está escribiendo...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex-shrink-0 px-3 pb-3 pt-2.5 border-t border-slate-800/80 bg-slate-900/20 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={handleMessageInputChange}
                placeholder="Escribe un mensaje aquí..."
                disabled={sending}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !newMessageText.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (

          <div className="flex min-h-0 flex-1 flex-col justify-center items-center text-slate-500 gap-2 p-6 text-center">
            <MessageSquare className="w-12 h-12 text-slate-800" />
            <h3 className="text-slate-300 font-bold">Tus conversaciones</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Selecciona uno de los hilos de chat de la izquierda para ver los mensajes y coordinar con el vendedor.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
