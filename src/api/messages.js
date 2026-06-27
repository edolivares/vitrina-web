import { chatSchema, messageSchema } from '@/schemas/message.schema';
import { STORAGE_KEYS } from '@/config/constants';

const INITIAL_CHATS = [
  {
    id: '9f70bd54-f65d-4a86-a934-6f0dd37af851',
    postId: '7bcb4b49-45f2-4d95-9005-7f0583b2f3a1',
    postTitle: 'Bicicleta Trek Marlin 5 Aro 29',
    postPrice: 420000,
    postImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=200',
    sellerId: 'user-999',
    sellerName: 'Rodrigo Araya',
    buyerId: 'user-123',
    buyerName: 'Diego Valdivia',
    lastMessage: 'Hola, ¿aún está disponible la bicicleta? Podemos coordinar mañana.',
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '88c9f91e-d85b-45f0-8b1b-65ac61b671b5',
    postId: '587cd88e-e6bd-4d83-aa91-6f1c88de96e5',
    postTitle: 'Mesa de centro madera rústica',
    postPrice: 85000,
    postImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=200',
    sellerId: 'user-888',
    sellerName: 'Paula Espinoza',
    buyerId: 'user-123',
    buyerName: 'Diego Valdivia',
    lastMessage: 'Perfecto, nos vemos en el centro comercial a las 15:00.',
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

const INITIAL_MESSAGES = [
  {
    id: 'msg-p1',
    chatId: '88c9f91e-d85b-45f0-8b1b-65ac61b671b5',
    content: 'Hola Paula, me interesa mucho la mesa de roble. ¿Haces entregas a domicilio?',
    senderId: 'user-123',
    createdAt: new Date(Date.now() - 3600000 * 5.2).toISOString()
  },
  {
    id: 'msg-p2',
    chatId: '88c9f91e-d85b-45f0-8b1b-65ac61b671b5',
    content: 'Hola Diego. No tengo despacho a domicilio directo, pero podemos coordinar un punto de entrega intermedio o si prefieres puedes retirarla en mi taller en Coquimbo.',
    senderId: 'user-888',
    createdAt: new Date(Date.now() - 3600000 * 5.1).toISOString()
  },
  {
    id: 'msg-p3',
    chatId: '88c9f91e-d85b-45f0-8b1b-65ac61b671b5',
    content: 'Perfecto, nos vemos en el centro comercial a las 15:00.',
    senderId: 'user-123',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'msg-r1',
    chatId: '9f70bd54-f65d-4a86-a934-6f0dd37af851',
    content: 'Hola, ¿aún está disponible la bicicleta? Podemos coordinar mañana.',
    senderId: 'user-123',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
}
if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
}

function createId() {
  return crypto.randomUUID();
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getChatsFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
}

function saveChatsToStorage(chats) {
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

function getMessagesFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
}

function saveMessagesToStorage(messages) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

function migrateChatIdsToUuid() {
  const chats = getChatsFromStorage();
  const messages = getMessagesFromStorage();
  const idMap = new Map();

  chats.forEach((chat) => {
    if (!isUuid(chat.id)) {
      idMap.set(chat.id, createId());
    }
  });

  if (idMap.size === 0) return;

  saveChatsToStorage(chats.map(chat => ({
    ...chat,
    id: idMap.get(chat.id) || chat.id
  })));

  saveMessagesToStorage(messages.map(message => ({
    ...message,
    chatId: idMap.get(message.chatId) || message.chatId
  })));
}

migrateChatIdsToUuid();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetChats(userId) {
  await delay(300);
  const chats = getChatsFromStorage();
  return chats.filter(chat => chat.sellerId === userId || chat.buyerId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function mockGetMessages(chatId) {
  await delay(200);
  const messages = getMessagesFromStorage();
  return messages.filter(msg => msg.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function mockSendMessage(chatId, content, senderId) {
  messageSchema.parse({ chatId, content, senderId, createdAt: new Date().toISOString() });

  await delay(100);

  const messages = getMessagesFromStorage();
  const chats = getChatsFromStorage();

  const newMessage = {
    id: `msg-${Math.random().toString(36).substring(2, 9)}`,
    chatId,
    content,
    senderId,
    createdAt: new Date().toISOString()
  };

  messages.push(newMessage);
  saveMessagesToStorage(messages);

  const chatIndex = chats.findIndex(c => c.id === chatId);
  if (chatIndex !== -1) {
    chats[chatIndex].lastMessage = content;
    chats[chatIndex].updatedAt = newMessage.createdAt;
    saveChatsToStorage(chats);
  }

  return newMessage;
}

export async function mockCreateChat(post, currentUser) {
  if (!currentUser) {
    throw new Error('Debe iniciar sesión para iniciar una conversación');
  }
  if (post.sellerId === currentUser.id) {
    throw new Error('No puedes chatear contigo mismo sobre tu publicación');
  }

  await delay(500);

  const chats = getChatsFromStorage();

  const existingChat = chats.find(c => c.postId === post.id && c.buyerId === currentUser.id);
  if (existingChat) {
    return existingChat;
  }

  const newChat = {
    id: createId(),
    postId: post.id,
    postTitle: post.title,
    postPrice: post.price,
    postImage: post.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=200',
    sellerId: post.sellerId,
    sellerName: post.sellerName,
    buyerId: currentUser.id,
    buyerName: currentUser.name,
    lastMessage: 'Conversación iniciada',
    updatedAt: new Date().toISOString()
  };

  chatSchema.parse(newChat);

  chats.unshift(newChat);
  saveChatsToStorage(chats);

  const messages = getMessagesFromStorage();
  messages.push({
    id: `msg-sys-${Math.random().toString(36).substring(2, 9)}`,
    chatId: newChat.id,
    content: `Hola ${post.sellerName}, me interesa tu publicación "${post.title}". ¿Sigue disponible?`,
    senderId: currentUser.id,
    createdAt: new Date().toISOString()
  });
  saveMessagesToStorage(messages);

  return newChat;
}
