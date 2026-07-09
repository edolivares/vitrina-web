import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { sileo } from 'sileo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/context/UserContext';
import { loginSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export function Login() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const rawFrom = location.state?.from?.pathname || searchParams.get('redirect') || '/';
  const from = (rawFrom === '/login' || rawFrom === '/registro') ? '/' : rawFrom;

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error de conexión';
      sileo.error({
        title: 'No se pudo iniciar sesión',
        description: errorMsg,
      });
    }
  };

  return (
    <div className="w-full max-w-md py-12 px-6">
      <Helmet>
        <title>Iniciar Sesión | Vitrina</title>
        <meta name="description" content="Inicia sesión en tu cuenta de Vitrina para gestionar tus publicaciones y conversar con compradores y vendedores." />
      </Helmet>
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col gap-6">

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

        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Correo Electrónico
              </label>
              <Input
                type="text"
                {...register('email')}
                placeholder="nombre@correo.com"
                disabled={isSubmitting}
                className={`w-full bg-white border rounded-xl h-11 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                  errors.email
                    ? 'border-rose-500/50 focus-visible:border-rose-500'
                    : 'border-slate-300 focus-visible:border-indigo-500'
                }`}
              />
              {errors.email && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-400">
                  Contraseña
                </label>
              </div>
              <div className="relative w-full flex items-center">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`w-full bg-white border rounded-xl h-11 pl-3.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                    errors.password
                      ? 'border-rose-500/50 focus-visible:border-rose-500'
                      : 'border-slate-300 focus-visible:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-[0.98] border-none"
              size="lg"
            >
              {isSubmitting ? (
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
