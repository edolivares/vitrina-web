import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { sileo } from 'sileo';
import { useChats } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { playChatNotificationSound } from '@/lib/notificationSound';
import { formatPrice } from '@/lib/format';

const getOtherParticipantName = (chat, userId) => {
  if (!chat || !userId) return 'Alguien';
  return chat.seller === userId ? chat.buyerName : chat.sellerName;
};

const getMessagePreview = (message) => {
  if (!message) return 'Quiere conversar sobre tu publicación.';
  return message.length > 76 ? `${message.slice(0, 73)}...` : message;
};

export function ChatNotificationToasts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { lastChatEvent } = useChats();
  const shownEventsRef = useRef(new Set());

  useEffect(() => {
    if (!user || lastChatEvent?.type !== 'created' || !lastChatEvent.chat) return;

    const { chat, receivedAt } = lastChatEvent;
    const eventKey = `${chat.id}-${receivedAt}`;
    if (shownEventsRef.current.has(eventKey)) return;
    shownEventsRef.current.add(eventKey);

    if (!chat.isUnread) return;
    if (location.pathname === `/mensajes/${chat.id}`) return;

    const otherName = getOtherParticipantName(chat, user.id);
    const messagePreview = getMessagePreview(chat.lastMessage);
    const formattedPrice = Number.isFinite(chat.postPrice) ? formatPrice(chat.postPrice) : null;

    playChatNotificationSound();

    sileo.action({
      title: `Nuevo chat de ${otherName}`,
      description: (
        <div className="flex min-w-0 items-center gap-3 pt-1">
          {chat.postImage ? (
            <img
              src={chat.postImage}
              alt=""
              className="size-12 flex-shrink-0 rounded-xl border border-indigo-300/20 object-cover shadow-sm"
            />
          ) : (
            <span className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-100">
              <MessageSquare className="size-5" />
            </span>
          )}
          <span className="min-w-0 text-left">
            <span className="block truncate text-xs font-semibold text-slate-50">
              {chat.postTitle}
            </span>
            {formattedPrice && (
              <span className="mt-0.5 block text-[11px] font-semibold text-indigo-200">
                {formattedPrice}
              </span>
            )}
            <span className="mt-1 block line-clamp-2 text-xs leading-snug text-slate-300">
              {messagePreview}
            </span>
          </span>
        </div>
      ),
      icon: null,
      duration: 9000,
      button: {
        title: 'Ir al chat',
        onClick: () => navigate(`/mensajes/${chat.id}`),
      },
      styles: {
        title: 'text-left text-indigo-100',
        description: 'chat-toast-description w-full',
        button: 'chat-toast-button font-semibold',
      },
      fill: '#111827',
    });
  }, [lastChatEvent, location.pathname, navigate, user]);

  return null;
}
