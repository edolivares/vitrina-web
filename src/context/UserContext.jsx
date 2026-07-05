import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshSession, getMe } from '@/api/auth';
import { STORAGE_KEYS } from '@/config/constants';

/**
 * Contexto global para la gestión del estado del usuario y la autenticación.
 */
const UserContext = createContext(null);

/**
 * Proveedor del contexto de usuario. Administra la sesión del usuario,
 * sincronización con localStorage y estado de verificación inicial.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Nodos hijos a renderizar.
 * @returns {React.ReactElement} Proveedor de contexto React.
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    /**
     * Restaura la sesión del usuario al cargar la página a partir del token de acceso o intentando
     * refrescar la sesión si el token expiró.
     */
    const restoreSession = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        try {
          const profile = await getMe();
          setUser(profile);
        } catch (error) {
          try {
            const data = await refreshSession();
            setUser(data.user);
          } catch (refreshError) {
            await logout();
          }
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  useEffect(() => {
    /**
     * Escucha el evento global de cierre de sesión para limpiar el estado del usuario de inmediato.
     */
    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  /**
   * Autentica un usuario con credenciales.
   *
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} Datos del usuario autenticado.
   */
  const login = async (email, password) => {
    const loggedUser = await apiLogin(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  /**
   * Registra un nuevo usuario e inicia sesión automáticamente.
   *
   * @param {Object} userData - Datos de registro (nombre, email, contraseña).
   * @returns {Promise<Object>} Datos del usuario autenticado y registrado.
   */
  const register = async (userData) => {
    await apiRegister(userData);
    const loggedUser = await login(userData.email, userData.password);
    return loggedUser;
  };

  /**
   * Cierra la sesión del usuario actual, invalida el token en el backend y limpia local storage.
   * 
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  /**
   * Actualiza los datos locales del usuario actual en memoria y desencadena la sincronización.
   * 
   * @param {Object} updatedData - Datos de perfil actualizados del usuario.
   */
  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook para consumir los datos y métodos de autenticación del UserProvider.
 *
 * @throws {Error} Si el hook es utilizado fuera del UserProvider.
 * @returns {Object} Objeto con el estado del usuario y métodos auxiliares.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe utilizarse dentro de un UserProvider');
  }
  return context;
}
