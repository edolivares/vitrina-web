import { test, expect } from '@playwright/test';

// Mock de base de datos local en memoria para los tests
const MOCK_USER = {
  id: 'f516c6b3-8df4-44ec-93db-5c7058cd72bd',
  name: 'Diego Valdivia',
  email: 'diego@vitrina.cl',
  bio: 'Hola a todos',
  avatar: null,
};

test.describe('Flujo de Autenticación de Vitrina', () => {
  test.beforeEach(async ({ page }) => {
    // Capturar logs y errores del navegador para depuración
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    // Mockear la galería pública usando una expresión regular estricta
    await page.route(/\/api\/posts(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [],
        }),
      });
    });

    // Mockear /api/auth/me para que falle por defecto (sin sesión inicial)
    await page.route(/\/api\/auth\/me$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          message: 'Token no proporcionado',
        }),
      });
    });
  });

  test('debe permitir iniciar sesión con credenciales válidas y persistir sesión', async ({ page }) => {
    // Mockear login exitoso y entrega de cookie segura de refresh token
    await page.route(/\/api\/auth\/login$/, async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': 'vitrina_refresh_token=valid-refresh-token; Path=/api/auth; HttpOnly; SameSite=Lax',
        },
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          token: 'valid-access-token-123',
          data: MOCK_USER,
        }),
      });
    });

    // Mockear /api/auth/me exitoso para cuando cargue con token válido
    await page.route(/\/api\/auth\/me$/, async (route) => {
      if (route.request().headers()['authorization'] === 'Bearer valid-access-token-123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: MOCK_USER,
          }),
        });
      } else {
        await route.fulfill({ status: 401 });
      }
    });

    // Navegar al Login
    await page.goto('/login');

    // Hacemos click en iniciar sesión
    await page.click('button[type="submit"]');

    // Debería redirigir al Home y mostrar la inicial del nombre en el avatar
    await expect(page).toHaveURL('/');
    
    // El AvatarFallback debería mostrar las iniciales DV
    const avatarFallback = page.getByText('DV', { exact: true });
    await expect(avatarFallback).toBeVisible();

    // Validar que se guardó el token en localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('vitrina_access_token'));
    expect(savedToken).toBe('valid-access-token-123');

    // Verificar que el navegador recibió la cookie HttpOnly
    const cookies = await page.context().cookies();
    const refreshCookie = cookies.find(c => c.name === 'vitrina_refresh_token');
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie.value).toBe('valid-refresh-token');
    expect(refreshCookie.httpOnly).toBe(true);

    // Recargar la página para verificar la persistencia de la sesión
    await page.reload();
    await expect(page.getByText('DV', { exact: true })).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Mockear login fallido
    await page.route(/\/api\/auth\/login$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          message: 'Correo o contraseña incorrectos',
        }),
      });
    });

    await page.goto('/login');

    // Intentar iniciar sesión
    await page.click('button[type="submit"]');

    // Debe mostrar la notificación de error
    const errorToast = page.locator('text=Correo o contraseña incorrectos');
    await expect(errorToast).toBeVisible();
  });

  test('debe permitir registrarse, hacer auto-login y redirigir', async ({ page }) => {
    // Mockear registro exitoso
    await page.route(/\/api\/auth\/register$/, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: MOCK_USER,
        }),
      });
    });

    // Mockear login inmediato tras el registro
    await page.route(/\/api\/auth\/login$/, async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': 'vitrina_refresh_token=valid-refresh-token-reg; Path=/api/auth; HttpOnly; SameSite=Lax',
        },
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          token: 'token-registro-auto-login',
          data: MOCK_USER,
        }),
      });
    });

    await page.goto('/registro');

    // Llenar campos
    await page.fill('input[placeholder="Juan Gómez"]', 'Diego Valdivia');
    await page.fill('input[placeholder="juan@correo.com"]', 'diego@vitrina.cl');
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', 'password123');
    await page.fill('input[placeholder="Repite la contraseña"]', 'password123');

    await page.click('button[type="submit"]');

    // Debe redirigir a Home por el auto-login
    await expect(page).toHaveURL('/');
    await expect(page.getByText('DV', { exact: true })).toBeVisible();

    // Confirmar que la cookie de refresh token se seteó en auto-login
    const cookies = await page.context().cookies();
    expect(cookies.some(c => c.name === 'vitrina_refresh_token')).toBe(true);
  });

  test('debe renovar el token automáticamente al expirar (401/403) y re-intentar', async ({ page }) => {
    // Simular que el usuario ya está logueado en localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('vitrina_access_token', 'expired-token');
      localStorage.setItem('vitrina_auth_user', JSON.stringify({
        id: 'f516c6b3-8df4-44ec-93db-5c7058cd72bd',
        name: 'Diego Valdivia',
        email: 'diego@vitrina.cl',
      }));
    });

    // Inyectar cookie de refresh token antes del reload
    await page.context().addCookies([{
      name: 'vitrina_refresh_token',
      value: 'expired-refresh-token',
      domain: 'localhost',
      path: '/api/auth',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Registrar mock de refresh token exitoso y verificación de que se envíe la cookie
    let hasSentCookieOnRefresh = false;
    await page.route(/\/api\/auth\/refresh$/, async (route) => {
      const cookieHeader = route.request().headers()['cookie'] || '';
      if (cookieHeader.includes('vitrina_refresh_token=expired-refresh-token')) {
        hasSentCookieOnRefresh = true;
      }

      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': 'vitrina_refresh_token=fresh-refresh-token; Path=/api/auth; HttpOnly; SameSite=Lax',
        },
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          token: 'fresh-new-token-999',
          data: MOCK_USER,
        }),
      });
    });

    // Mockear petición que inicialmente falla con 401 por el token expirado, pero que funciona al re-intentar con el nuevo token
    let apiCallCounter = 0;
    await page.route(/\/api\/auth\/me$/, async (route) => {
      apiCallCounter++;
      const authHeader = route.request().headers()['authorization'];
      
      if (authHeader === 'Bearer expired-token') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'error', message: 'Token expirado' }),
        });
      } else if (authHeader === 'Bearer fresh-new-token-999') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: MOCK_USER,
          }),
        });
      } else {
        await route.fulfill({ status: 401 });
      }
    });

    // Recargar para aplicar estado inicial y gatillar el restoreSession
    await page.reload();

    // Debe resolver exitosamente el refresh en segundo plano y mostrar el header con DV
    await expect(page.getByText('DV', { exact: true })).toBeVisible();
    
    // Verificar que se haya enviado la cookie HttpOnly en el request de refresh
    expect(hasSentCookieOnRefresh).toBe(true);

    const savedToken = await page.evaluate(() => localStorage.getItem('vitrina_access_token'));
    expect(savedToken).toBe('fresh-new-token-999');
    expect(apiCallCounter).toBeGreaterThanOrEqual(2); // La petición falló con expired-token, se refrescó y se re-intentó exitosamente
  });

  test('debe permitir cerrar sesión y limpiar datos locales', async ({ page }) => {
    // Inyectar cookie de refresh token antes de la prueba
    await page.context().addCookies([{
      name: 'vitrina_refresh_token',
      value: 'valid-refresh-token-logout',
      domain: 'localhost',
      path: '/api/auth',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Registrar mock de logout exitoso y validación de que se envíe la cookie
    let hasSentCookieOnLogout = false;
    await page.route(/\/api\/auth\/logout$/, async (route) => {
      const cookieHeader = route.request().headers()['cookie'] || '';
      if (cookieHeader.includes('vitrina_refresh_token=valid-refresh-token-logout')) {
        hasSentCookieOnLogout = true;
      }

      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': 'vitrina_refresh_token=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Lax',
        },
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Sesión cerrada' }),
      });
    });

    await page.route(/\/api\/auth\/me$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: MOCK_USER }),
      });
    });

    // Iniciar con sesión activa
    await page.goto('/');
    await page.evaluate((user) => {
      localStorage.setItem('vitrina_access_token', 'token-valido');
      localStorage.setItem('vitrina_auth_user', JSON.stringify(user));
    }, MOCK_USER);
    
    await page.reload();

    // Hacer click en botón de cerrar sesión (icono LogOut en el Header)
    await page.click('button[title="Cerrar sesión"]');

    // Verificar que se haya enviado la cookie HttpOnly en el request de logout
    expect(hasSentCookieOnLogout).toBe(true);

    // Debe limpiar localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('vitrina_access_token'));
    const savedUser = await page.evaluate(() => localStorage.getItem('vitrina_auth_user'));
    expect(savedToken).toBeNull();
    expect(savedUser).toBeNull();

    // La cookie del navegador debe haber expirado (limpiada)
    const cookies = await page.context().cookies();
    const refreshCookie = cookies.find(c => c.name === 'vitrina_refresh_token');
    expect(refreshCookie?.value || '').toBe(''); // Vacía o expirada

    // Debe mostrar los enlaces de registro e ingresar nuevamente
    await expect(page.locator('text=Ingresar')).toBeVisible();
  });

  test('debe limpiar la sesión y redirigir a /login si el refresh token también expiró o es inválido', async ({ page }) => {
    // Simular que el usuario tiene un token expirado en localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('vitrina_access_token', 'expired-token');
      localStorage.setItem('vitrina_auth_user', JSON.stringify({
        id: 'f516c6b3-8df4-44ec-93db-5c7058cd72bd',
        name: 'Diego Valdivia',
        email: 'diego@vitrina.cl',
      }));
    });

    // Mockear refresh token fallido (401)
    await page.route(/\/api\/auth\/refresh$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          message: 'Refresh token invalido o expirado',
        }),
      });
    });

    // Mockear /api/auth/me que falla con 401 por el token viejo
    await page.route(/\/api\/auth\/me$/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', message: 'Token expirado' }),
      });
    });

    // Recargar la página (disparará restoreSession que intentará refrescar y fallará)
    await page.reload();

    // Debería redirigir automáticamente a /login
    await expect(page).toHaveURL(/\/login/);

    // Debe haber limpiado localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('vitrina_access_token'));
    const savedUser = await page.evaluate(() => localStorage.getItem('vitrina_auth_user'));
    expect(savedToken).toBeNull();
    expect(savedUser).toBeNull();
  });
});
