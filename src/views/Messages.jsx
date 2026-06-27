import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@/context/UserContext';
import { mockGetChats, mockGetMessages, mockSendMessage } from '@/api/messages';
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

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

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

  const loadChats = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedChats = await mockGetChats(user.id);
      setChats(fetchedChats);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadChats();
    });
  }, [loadChats]);

  useEffect(() => {
    if (!legacyChatId || routeChatId) return;

    const suffix = activePostId ? `?post=${activePostId}` : '';
    navigate(`/mensajes/${legacyChatId}${suffix}`, { replace: true });
  }, [activePostId, legacyChatId, navigate, routeChatId]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeChatId || !activeChat) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        const fetchedMessages = await mockGetMessages(activeChatId);
        setMessages(fetchedMessages);

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
  }, [activeChat, activeChatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatId || !user) return;

    setSending(true);
    const content = newMessageText.trim();
    setNewMessageText('');

    try {
      const sentMsg = await mockSendMessage(activeChatId, content, user.id);
      setMessages(prev => [...prev, sentMsg]);

      const updatedChats = await mockGetChats(user.id);
      setChats(updatedChats);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch {
      sileo.error({
        title: 'No se pudo enviar el mensaje',
        description: 'El mensaje quedó sin enviar en esta maqueta.'
      });
    } finally {
      setSending(false);
    }
  };

  const selectChat = (chatId) => {
    navigate(activePostId ? `/mensajes/${chatId}?post=${activePostId}` : `/mensajes/${chatId}`);
  };

  const getOtherParticipantName = (chat) => {
    return chat.seller === user.id ? chat.buyerName : chat.sellerName;
  };

  if (!user) return null;

  return (
    <div className="flex-1 w-full p-4 flex gap-6 h-[calc(100vh-120px)]">
      <Helmet>
        <title>Mis Mensajes | Vitrina</title>
        <meta name="description" content="Conversa directamente con compradores y vendedores sobre tus artículos de manera privada y segura." />
      </Helmet>

      {}
      <div className={`w-full md:w-80 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            {activePostId || legacyPostId ? 'Mensajes del producto' : 'Mensajes'}
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
          <div className="flex-1 flex justify-center items-center text-slate-500 text-xs">Cargando bandeja...</div>
        ) : visibleChats.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center text-slate-500 gap-2">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <span className="text-xs">
              {activePostId || legacyPostId ? 'No hay conversaciones para esta publicacion' : 'No tienes conversaciones activas'}
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {visibleChats.map(chat => {
              const isActive = chat.id === activeChatId;
              const otherName = getOtherParticipantName(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full p-4 border-b border-slate-800 flex items-center gap-3 text-left transition-all ${
                    isActive ? 'bg-indigo-600/15 text-indigo-100 border-l-4 border-l-indigo-500 pl-3' : 'hover:bg-slate-800/40 pl-4'
                  }`}
                >
                  <img src={chat.postImage} alt={chat.postTitle} className="w-12 h-12 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-300 truncate">{otherName}</span>
                      <span className="text-[9px] text-slate-500">
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 truncate">{chat.postTitle}</span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">{chat.lastMessage}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {}
      <div className={`flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        activeChatId ? 'flex' : 'hidden md:flex'
      }`}>

        {activeChatId && activeChat ? (
          <>
            {}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/40">

              {}
              <button
                onClick={() => navigate(activePostId ? `/mensajes/publicacion/${activePostId}` : '/mensajes')}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 md:hidden transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <img src={activeChat.postImage} alt={activeChat.postTitle} className="w-10 h-10 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-200">
                    {getOtherParticipantName(activeChat)}
                  </span>
                  <Link to={`/publicacion/${activeChat.postId}`} className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 mt-0.5 truncate">
                    <span>{activeChat.postTitle}</span>
                    <span className="font-semibold text-indigo-400">{formatPrice(activeChat.postPrice)}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {loadingMessages ? (
                <div className="flex-1 flex justify-center items-center text-slate-500 text-xs">Cargando mensajes...</div>
              ) : (
                messages.map(msg => {
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/80 bg-slate-900/20 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
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
          </>
        ) : (

          <div className="flex-1 flex flex-col justify-center items-center text-slate-500 gap-2 p-6 text-center">
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
