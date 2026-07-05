import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, User, LogOut } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useChats } from '@/context/ChatContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function Header({ showLogo = true }) {
  const { user, logout } = useUser();
  const { hasUnreadMessages } = useChats();
  const navigate = useNavigate();
  const location = useLocation();
  const authRedirect = `${location.pathname}${location.search}`;
  const authQuery = authRedirect === '/' ? '' : `?redirect=${encodeURIComponent(authRedirect)}`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'text-indigo-400 bg-indigo-500/10 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
      {showLogo ? (
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.svg"
            alt="Vitrina Logo"
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent font-sans">
            Vitrina
          </span>
        </Link>
      ) : (
        <div />
      )}

      {user && (
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={navItemClass}>
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </NavLink>

          <NavLink to="/mensajes" className={navItemClass}>
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              {hasUnreadMessages && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </div>
            <span className="hidden sm:inline">Mensajes</span>
          </NavLink>

          <NavLink to="/perfil" className={navItemClass}>
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Mi Perfil</span>
          </NavLink>
        </nav>
      )}

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border border-slate-700">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-slate-800 text-[10px] text-slate-200 font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to={`/registro${authQuery}`}
              className="hidden sm:inline-flex px-4 py-1.5 rounded-lg text-sm font-semibold text-indigo-200 hover:text-white hover:bg-indigo-500/10 transition-all active:scale-95"
            >
              Crea tu cuenta
            </Link>
            <Link
              to={`/login${authQuery}`}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Ingresar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
