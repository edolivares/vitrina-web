import { loginSchema, registerSchema } from '@/schemas/auth.schema';

const DEFAULT_USER = {
  id: 'user-123',
  name: 'Diego Valdivia',
  email: 'diego@vitrina.cl',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockLogin(email, password) {

  loginSchema.parse({ email, password });

  await delay(800);

  if (email === 'admin@vitrina.cl' && password === '123456') {
    throw new Error('Credenciales inválidas');
  }

  return {
    ...DEFAULT_USER,
    email
  };
}

export async function mockRegister(userData) {

  registerSchema.parse(userData);

  await delay(800);

  return {
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    name: userData.name,
    email: userData.email,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  };
}
