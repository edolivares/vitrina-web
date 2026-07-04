import apiClient from './apiClient';
import { STORAGE_KEYS } from '@/config/constants';

const mapUserResponse = (user) => {
  if (!user) return null;
  return {
    ...user,
    avatarUrl: user.avatar?.url || null,
  };
};

export async function login(email, password) {
  const response = await apiClient.post('/api/auth/login', { email, password });
  const { token, data: user } = response.data;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  return mapUserResponse(user);
}

export async function register(userData) {
  const payload = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
  };

  const response = await apiClient.post('/api/auth/register', payload);
  return mapUserResponse(response.data.data);
}

export async function logout() {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    console.error('Error al revocar la sesión en el servidor:', error);
  } finally {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  }
}

export async function refreshSession() {
  const response = await apiClient.post('/api/auth/refresh');
  const { token, data: user } = response.data;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  return {
    token,
    user: mapUserResponse(user),
  };
}

export async function getMe() {
  const response = await apiClient.get('/api/auth/me');
  return mapUserResponse(response.data.data);
}
