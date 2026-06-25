import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@/context/UserContext';
import { loginSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('diego@vitrina.cl');
  const [password, setPassword] = useState('password123');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);
    setSubmitting(true);

    try {

      loginSchema.parse({ email, password });

      await login(email, password);

      navigate(from, { replace: true });
    } catch (err) {
      if (err.name === 'ZodError') {
        const fieldErrors = {};
        err.errors.forEach((validationError) => {
          fieldErrors[validationError.path[0]] = validationError.message;
        });
        setErrors(fieldErrors);
      } else {

        setApiError(err.message || 'Error de conexión');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md py-12 px-6">
      <Helmet>
        <title>Iniciar Sesión | Vitrina</title>
        <meta name="description" content="Inicia sesión en tu cuenta de Vitrina para gestionar tus publicaciones y conversar con compradores y vendedores." />
      </Helmet>
      <Card className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-xl flex flex-col gap-6">

        {}
        <CardHeader className="text-center flex flex-col gap-1.5 p-0 border-none bg-transparent">
          <div className="mx-auto p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-2">
            <LogIn className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Ingresar a Vitrina
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Digita tus credenciales para acceder a tu perfil
          </CardDescription>
        </CardHeader>

        {}
        {apiError && (
          <div className="flex gap-2.5 items-start bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">No se pudo iniciar sesión</span>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {}
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Correo Electrónico
              </label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                disabled={submitting}
                className={`w-full bg-slate-950 border rounded-xl h-11 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                  errors.email
                    ? 'border-rose-500/50 focus-visible:border-rose-500'
                    : 'border-slate-800 focus-visible:border-indigo-500'
                }`}
              />
              {errors.email && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.email}
                </span>
              )}
            </div>

            {}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-400">
                  Contraseña
                </label>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className={`w-full bg-slate-950 border rounded-xl h-11 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                  errors.password
                    ? 'border-rose-500/50 focus-visible:border-rose-500'
                    : 'border-slate-800 focus-visible:border-indigo-500'
                }`}
              />
              {errors.password && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.password}
                </span>
              )}
            </div>

            {}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-[0.98] border-none"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando datos...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </CardContent>

        <div className="h-px bg-slate-800/60" />

        {}
        <div className="text-center text-xs text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link
            to={`/registro?redirect=${encodeURIComponent(from)}`}
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Registrarse aquí
          </Link>
        </div>

      </Card>
    </div>
  );
}
