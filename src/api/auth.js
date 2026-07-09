import apiClient from './apiClient';
import { STORAGE_KEYS } from '@/config/constants';

/**
 * Mapea y normaliza la respuesta del objeto usuario agregando la url del avatar.
 * 
 * @param {Object|null} user - Objeto de usuario recibido de la API.
 * @returns {Object|null} Objeto de usuario normalizado con la URL del avatar.
 */
const mapUserResponse = (user) => {
  if (!user) return null;
  return {
    ...user,
    avatarUrl: user.avatar?.url || null,
  };
};

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error.response?.data?.message ||
    error.response?.data?.details?.join(', ') ||
    error.message ||
    fallbackMessage
  );
}

/**
 * Inicia sesión con el email y contraseña especificados.
 * Almacena el token de acceso obtenido en el localStorage.
 * 
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<Object>} Perfil normalizado del usuario autenticado.
 */
export async function login(email, password) {
  const response = await apiClient.post('/api/auth/login', { email, password });
  const { token, data: user } = response.data;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  return mapUserResponse(user);
}

/**
 * Registra un nuevo usuario en la plataforma.
 * 
 * @param {Object} userData - Datos de registro del usuario.
 * @param {string} userData.name - Nombre completo.
 * @param {string} userData.email - Correo electrónico.
 * @param {string} userData.password - Contraseña.
 * @returns {Promise<Object>} Datos del usuario registrado y normalizado.
 */
export async function register(userData) {
  const payload = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
  };

  const response = await apiClient.post('/api/auth/register', payload);
  return mapUserResponse(response.data.data);
}

/**
 * Cierra la sesión activa del usuario.
 * Notifica al servidor para limpiar cookies y remueve la información local.
 * 
 * @returns {Promise<void>}
 */
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

/**
 * Envía una petición para renovar el token de acceso utilizando la cookie de refresco.
 * Actualiza el token de acceso en el localStorage.
 * 
 * @returns {Promise<Object>} Objeto con el nuevo token y los datos de usuario mapeados.
 */
export async function refreshSession() {
  const response = await apiClient.post('/api/auth/refresh');
  const { token, data: user } = response.data;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  return {
    token,
    user: mapUserResponse(user),
  };
}

/**
 * Obtiene el perfil de usuario del usuario autenticado actual.
 * 
 * @returns {Promise<Object>} Perfil normalizado del usuario actual.
 */
export async function getMe() {
  const response = await apiClient.get('/api/auth/me');
  return mapUserResponse(response.data.data);
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/api/auth/me/avatar', formData);
    return mapUserResponse(response.data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudo actualizar la foto de perfil.'), { cause: error });
  }
}
