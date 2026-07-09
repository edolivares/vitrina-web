/**
 * @fileoverview Servicio de API para la gestión de chats y mensajes de la plataforma.
 * Conecta el frontend con los endpoints del backend para mensajería en tiempo real.
 */

import apiClient from './apiClient';
import { getPusherHeaders } from '@/lib/realtime';

/**
 * Mapea y normaliza un objeto Chat proveniente del backend.
 *
 * @param {Object} chat - Objeto chat crudo del backend.
 * @returns {Object|null} Objeto chat mapeado para el frontend.
 */
export const mapChatResponse = (chat) => {
  if (!chat) return null;
  return {
    id: chat.id,
    postId: chat.postId,
    postTitle: chat.postTitle,
    postPrice: Number(chat.postPrice),
    postImage: chat.postImage?.url || null,
    seller: chat.seller?.id,
    sellerName: chat.seller?.name,
    buyer: chat.buyer?.id,
    buyerName: chat.buyer?.name,
    lastMessage: chat.lastMessage,
    lastMessageAt: chat.lastMessageAt,
    isUnread: chat.isUnread,
    createdAt: chat.createdAt,
    updatedAt: chat.lastMessageAt || chat.updatedAt,
  };
};

/**
 * Mapea y normaliza un objeto Mensaje proveniente del backend.
 *
 * @param {Object} msg - Objeto mensaje crudo del backend.
 * @returns {Object|null} Objeto mensaje mapeado para el frontend.
 */
export const mapMessageResponse = (msg) => {
  if (!msg) return null;
  return {
    id: msg.id,
    chatId: msg.chatId,
    content: msg.content,
    sender: msg.senderId, // Mapea senderId del backend a sender del frontend
    createdAt: msg.createdAt,
  };
};

/**
 * Obtiene el listado de conversaciones/chats en las que participa el usuario actual.
 *
 * @returns {Promise<Array<Object>>} Listado de conversaciones normalizadas.
 */
export async function getChats() {
  const response = await apiClient.get('/api/chats');
  const chats = response.data.data || [];
  return chats.map(mapChatResponse);
}

/**
 * Obtiene el listado de mensajes asociados a una conversación específica.
 *
 * @param {string} chatId - UUID de la conversación.
 * @returns {Promise<Array<Object>>} Listado de mensajes ordenados cronológicamente.
 */
export async function getMessages(chatId) {
  const response = await apiClient.get(`/api/chats/${chatId}/messages`);
  const messages = response.data.data || [];
  return messages.map(mapMessageResponse);
}

/**
 * Envía un nuevo mensaje dentro de una conversación.
 *
 * @param {string} chatId - UUID de la conversación.
 * @param {string} content - Contenido del mensaje.
 * @returns {Promise<Object>} Datos del mensaje enviado.
 */
export async function sendMessage(chatId, content) {
  const response = await apiClient.post(
    `/api/chats/${chatId}/messages`,
    { content },
    { headers: getPusherHeaders() }
  );
  return mapMessageResponse(response.data.data);
}

/**
 * Crea una nueva conversación para un artículo específico, o recupera la existente.
 *
 * @param {string} postId - UUID del artículo.
 * @returns {Promise<Object>} Datos de la conversación creada o recuperada.
 */
export async function createChat(postId) {
  const response = await apiClient.post(
    `/api/posts/${postId}/chats`,
    {},
    { headers: getPusherHeaders() }
  );
  return mapChatResponse(response.data.data);
}

/**
 * Marca una conversación específica como leída en el servidor.
 *
 * @param {string} chatId - UUID de la conversación.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function markChatAsRead(chatId) {
  const response = await apiClient.patch(`/api/chats/${chatId}/read`);
  return response.data;
}
