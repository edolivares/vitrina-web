import { createContext, useContext, useState, useEffect } from 'react';
import { mockLogin, mockRegister } from '@/api/auth';
import { STORAGE_KEYS } from '@/config/constants';

const UserContext = createContext(null);

export function UserProvider({ children }) {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const login = async (email, password) => {
    const loggedUser = await mockLogin(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const newUser = await mockRegister(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  };

  const toggleFavorite = (postId) => {
    if (!user) return;

    setFavorites((prevFavorites) => {
      const id = Number(postId);
      if (prevFavorites.includes(id)) {
        return prevFavorites.filter(favId => favId !== id);
      } else {
        return [...prevFavorites, id];
      }
    });
  };

  const isFavorite = (postId) => {
    return favorites.includes(Number(postId));
  };

  return (
    <UserContext.Provider value={{ user, favorites, login, logout, register, toggleFavorite, isFavorite }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe utilizarse dentro de un UserProvider');
  }
  return context;
}
