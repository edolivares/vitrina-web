import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@/context/UserContext';
import { mockGetChats, mockGetMessages, mockSendMessage } from '@/api/messages';

export function Messages() {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeChatId = searchParams.get('chatId');

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const loadChats = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedChats = await mockGetChats(user.id);
      setChats(fetchedChats);

      if (activeChatId) {
        const found = fetchedChats.find(c => c.id === activeChatId);
        if (found) setActiveChat(found);
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [user, activeChatId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadChats();
    });
  }, [loadChats]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeChatId) {
        setMessages([]);
        setActiveChat(null);
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
  }, [activeChatId]);

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
      alert('No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const selectChat = (chatId) => {
    setSearchParams({ chatId });
  };

  const getOtherParticipantName = (chat) => {
    return chat.sellerId === user.id ? chat.buyerName : chat.sellerName;
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
    <div className="flex-1 w-full p-4 flex gap-6 h-[calc(100vh-120px)]">
      <Helmet>
        <title>Mis Mensajes | Vitrina</title>
        <meta name="description" content="Conversa directamente con compradores y vendedores sobre tus artículos de manera privada y segura." />
      </Helmet>

      {}
      <div className={`w-full md:w-80 flex-shrink-0 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-800/80">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Mensajes
          </h2>
        </div>

        {loadingChats ? (
          <div className="flex-1 flex justify-center items-center text-slate-500 text-xs">Cargando bandeja...</div>
        ) : chats.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center text-slate-500 gap-2">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <span className="text-xs">No tienes conversaciones activas</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => {
              const isActive = chat.id === activeChatId;
              const otherName = getOtherParticipantName(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full p-4 border-b border-slate-900 flex items-center gap-3 text-left transition-colors ${
                    isActive ? 'bg-indigo-500/10' : 'hover:bg-slate-900/30'
                  }`}
                >
                  <img src={chat.postImage} alt={chat.postTitle} className="w-12 h-12 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-300 truncate">{otherName}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(chat.updatedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
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
      <div className={`flex-1 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        activeChatId ? 'flex' : 'hidden md:flex'
      }`}>

        {activeChatId && activeChat ? (
          <>
            {}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/40">

              {}
              <button
                onClick={() => setSearchParams({})}
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
                  const isMe = msg.senderId === user.id;
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
                            : 'bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-slate-600 mt-1 pl-1 pr-1">
                        {new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
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
