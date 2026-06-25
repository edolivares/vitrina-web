# Vitrina - Frontend

Frontend del marketplace P2P Vitrina, desarrollado con React, Vite y Tailwind CSS para proyecto final Desafío Latam.

Se usa pnpm 11 con workspace por seguridad. Nadie quiere más vulneraciones de npm.

## Simulación de Datos (Mock)

Para simular el comportamiento real y la persistencia de datos localmente en el navegador, se utiliza el `localStorage` con las siguientes llaves centralizadas en `src/config/constants.js`:

* **`vitrina_posts`**: Almacena un array de objetos con las publicaciones de productos de la galería.
* **`vitrina_drafts`**: Guarda un array de objetos representando los borradores de publicaciones en curso del usuario (límite de 5).
* **`vitrina_favorites`**: Almacena un array con los IDs de las publicaciones marcadas como favoritas por el usuario.
* **`vitrina_chats`**: Almacena un array de objetos que representan los hilos de conversación activos.
* **`vitrina_messages`**: Almacena un array de objetos que representan el historial de mensajes de los chats.
* **`vitrina_auth_user`**: Almacena un objeto con los datos del usuario logueado en la sesión activa.

Estas llaves y la lógica de simulación asociada en los servicios de API se eliminarán en su totalidad cuando se integre el backend real del proyecto.

## Scripts de Desarrollo

Para iniciar el servidor de desarrollo local:
```bash
pnpm run dev
```

Para validar errores de sintaxis y linter:
```bash
pnpm run lint
```
