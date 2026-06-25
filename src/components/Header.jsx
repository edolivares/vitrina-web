import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, User, LogOut } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function Header({ showLogo = true }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();

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

      {}
      <nav className="flex items-center gap-2">
        <NavLink to="/" end className={navItemClass}>
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Inicio</span>
        </NavLink>

        <NavLink to="/mensajes" className={navItemClass}>
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {}
            {user && (
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

      {}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            {}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            {}
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            {}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            Ingresar
          </Link>
        )}
      </div>
    </header>
  );
}
