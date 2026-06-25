import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UserProvider } from '@/context/UserContext';
import { Toaster } from 'sileo';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { Home } from '@/views/Home';
import { Login } from '@/views/Login';
import { Register } from '@/views/Register';
import { Profile } from '@/views/Profile';
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
        <Router>
          <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <Toaster position="bottom-right" />

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
              </Route>

              <Route element={<FullWidthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
              </Route>

            </Routes>

          </div>
        </Router>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App;
