import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { sileo } from 'sileo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/context/UserContext';
import { registerSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export function Register() {
  const { user, register: registerUser } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register: registerInput,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const rawRedirectPath = searchParams.get('redirect') || '/';
  const redirectPath = (rawRedirectPath === '/login' || rawRedirectPath === '/registro') ? '/' : rawRedirectPath;

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error en el servidor';
      sileo.error({
        title: 'No se pudo crear la cuenta',
        description: errorMsg,
      });
    }
  };

  return (
    <div className="w-full max-w-md py-12 px-6">
      <Helmet>
        <title>Registrarse | Vitrina</title>
        <meta name="description" content="Regístrate en Vitrina para comenzar a publicar tus productos y comunicarte directamente con compradores locales." />
      </Helmet>
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col gap-6">

        <CardHeader className="text-center flex flex-col gap-1.5 p-0 border-none bg-transparent">
          <div className="mx-auto p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Regístrate en Vitrina para publicar y guardar favoritos
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Nombre Completo
              </label>
              <Input
                type="text"
                {...registerInput('name')}
                placeholder="Juan Gómez"
                disabled={isSubmitting}
                className={`w-full bg-white border rounded-xl h-11 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                  errors.name
                    ? 'border-rose-500/50 focus-visible:border-rose-500'
                    : 'border-slate-300 focus-visible:border-indigo-500'
                }`}
              />
              {errors.name && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Correo Electrónico
              </label>
              <Input
                type="text"
                {...registerInput('email')}
                placeholder="juan@correo.com"
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
              <label className="text-xs font-medium text-slate-400">
                Contraseña
              </label>
              <div className="relative w-full flex items-center">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...registerInput('password')}
                  placeholder="Mínimo 6 caracteres"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Confirmar Contraseña
              </label>
              <div className="relative w-full flex items-center">
                <Input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  {...registerInput('passwordConfirm')}
                  placeholder="Repite la contraseña"
                  disabled={isSubmitting}
                  className={`w-full bg-white border rounded-xl h-11 pl-3.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                    errors.passwordConfirm
                      ? 'border-rose-500/50 focus-visible:border-rose-500'
                      : 'border-slate-300 focus-visible:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.passwordConfirm && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.passwordConfirm.message}
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
                  Creando cuenta...
                </>
              ) : (
                'Registrarse'
              )}
            </Button>
          </form>
        </CardContent>

        <div className="h-px bg-slate-800/60" />

        <div className="text-center text-xs text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </Card>
    </div>
  );
}
