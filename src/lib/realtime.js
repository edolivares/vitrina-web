import Pusher from 'pusher-js';
import apiClient from '@/api/apiClient';
import { STORAGE_KEYS } from '@/config/constants';

let pusherClient = null;

const pusherKey = import.meta.env.VITE_PUSHER_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;

export const isRealtimeConfigured = () => Boolean(pusherKey && pusherCluster);

export const getPusherClient = () => {
  if (!isRealtimeConfigured()) return null;

  if (!pusherClient) {
    pusherClient = new Pusher(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true,
      authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
          try {
            const response = await apiClient.post('/api/realtime/pusher/auth', {
              socket_id: socketId,
              channel_name: channel.name,
            });
            callback(null, response.data);
          } catch (error) {
            callback(error, null);
          }
        },
      }),
    });
  }

  return pusherClient;
};

export const disconnectPusher = () => {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
};

export const getPusherSocketId = () => pusherClient?.connection?.socket_id || null;

export const getPusherHeaders = () => {
  const socketId = getPusherSocketId();
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  return {
    ...(socketId ? { 'X-Pusher-Socket-Id': socketId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const userChannelName = (userId) => `private-user-${userId}`;

export const chatChannelName = (chatId) => `private-chat-${chatId}`;
