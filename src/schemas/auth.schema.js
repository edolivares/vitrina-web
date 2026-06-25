import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  passwordConfirm: z.string()
    .min(1, 'Debe confirmar su contraseña')
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm']
});
