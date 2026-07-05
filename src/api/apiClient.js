/**
 * @fileoverview Cliente HTTP configurado con Axios.
 * Maneja la inyección automática de tokens de acceso JWT (Bearer tokens)
 * en cada petición y la renovación automática mediante refresh tokens
 * interceptando las respuestas 401/403 no autorizadas.
 */

import axios from 'axios';
import { STORAGE_KEYS } from '@/config/constants';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Variable para controlar refrescos concurrentes y cola de peticiones pendientes
let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de peticiones fallidas por expiración de token.
 * Resuelve las peticiones encoladas si se obtiene un nuevo token,
 * o las rechaza si falla el refresco.
 * 
 * @param {Error|null} error - Error de refresco en caso de fallo, o null si fue exitoso.
 * @param {string|null} [token=null] - Nuevo token de acceso JWT si el refresco fue exitoso.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Interceptor de peticiones salientes de Axios.
 * Intercepta cada petición para inyectar automáticamente el Bearer Token (token de acceso)
 * recuperado de localStorage en la cabecera 'Authorization', si este existe.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de respuestas de Axios.
 * Captura y procesa errores 401 y 403 (de autenticación/autorización)
 * para realizar la renovación transparente de la sesión mediante el token de refresco:
 * 
 * 1. Si hay una petición de renovación en curso, encola el re-intento de esta petición.
 * 2. Si es la primera petición fallida, inicia el refresco silencioso llamando al endpoint /api/auth/refresh.
 * 3. Si la renovación tiene éxito, guarda el nuevo token, re-ejecuta la petición y libera la cola.
 * 4. Si la renovación falla (sesión expirada del todo), limpia el almacenamiento local y redirige a /login.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verificar si es un error de autenticación (401 o 403) y no es una ruta de autenticación base
    const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
    const isAuthEndpoint =
      originalRequest.url.includes('/api/auth/login') ||
      originalRequest.url.includes('/api/auth/register') ||
      originalRequest.url.includes('/api/auth/refresh');

    if (isAuthError && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya hay un refresco en curso, encolar esta petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar la sesión llamando a la ruta de refresh del backend
        // Usamos una llamada directa de axios para evitar disparar este mismo interceptor
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token, data } = response.data;

        // Guardar el nuevo token y los datos de perfil
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        if (data) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
        }

        // Actualizar header de la petición actual y procesar la cola
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        processQueue(null, token);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Si falla el refresco, limpiar sesión y redirigir
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);

        // Disparar evento personalizado para que UserContext actualice su estado
        window.dispatchEvent(new Event('auth:logout'));
        
        // Redirigir al login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
