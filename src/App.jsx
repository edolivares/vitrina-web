import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UserProvider } from '@/context/UserContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ChatProvider } from '@/context/ChatContext';
import { Toaster } from 'sileo';
import { Header } from '@/components/layout/Header';
import { ChatNotificationToasts } from '@/components/messages/ChatNotificationToasts';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { Home } from '@/views/Home';
import { Login } from '@/views/Login';
import { Register } from '@/views/Register';
import { Profile } from '@/views/Profile';
import { PublicProfile } from '@/views/PublicProfile';
import { Publish } from '@/views/Publish';
import { Detail } from '@/views/Detail';
import { Messages } from '@/views/Messages';

function MainLayout() {
  return (
    <main className="flex-1 flex flex-col min-w-0 w-full">
      <Outlet />
    </main>
  );
}

function FullWidthLayout() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <UserProvider>
        <FavoritesProvider>
          <ChatProvider>
            <Router>
              <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
                <Toaster position="bottom-right" theme="dark" />
                <ChatNotificationToasts />

            <Header />

            <Routes>

              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/publicacion/:id" element={<Detail />} />

                <Route
                  path="/perfil"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route path="/perfil/:profileId" element={<PublicProfile />} />

                <Route
                  path="/publicar"
                  element={
                    <ProtectedRoute>
                      <Publish />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/mensajes"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/mensajes/:chatId"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/mensajes/publicacion/:postId"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route element={<FullWidthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
              </Route>

            </Routes>

          </div>
        </Router>
          </ChatProvider>
        </FavoritesProvider>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App;
