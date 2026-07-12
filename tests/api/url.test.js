import { describe, expect, it } from 'vitest';
import { buildApiUrl, normalizeApiBaseUrl } from '@/api/url';

describe('URLs de la API', () => {
  it('elimina barras finales de la URL base', () => {
    expect(normalizeApiBaseUrl('https://vitrina-backend.vercel.app/')).toBe(
      'https://vitrina-backend.vercel.app'
    );
  });

  it('construye la URL de refresh sin una doble barra', () => {
    expect(buildApiUrl('https://vitrina-backend.vercel.app/', '/api/auth/refresh')).toBe(
      'https://vitrina-backend.vercel.app/api/auth/refresh'
    );
  });
});
