# Flujo de notificaciones de mensajes

## Objetivo

Definir cuándo la interfaz de Vitrina debe mostrar una notificación global por mensajes y cuándo debe limitarse a actualizar señales visuales existentes.

La regla principal es evitar ruido: Sileo debe reservarse para eventos de alto valor, no para cada mensaje.

## Señales disponibles

La experiencia de mensajes usa tres niveles de señal:

- indicador global en el ícono de mensajes;
- estado visual de conversación pendiente en la lista;
- notificación Sileo enriquecida para eventos especiales.

## Regla principal

Mostrar Sileo solo cuando se crea un chat nuevo.

No mostrar Sileo para mensajes nuevos en chats existentes.

## Casos

### 1. Chat nuevo recibido

Este caso sí debe mostrar una notificación Sileo.

Contenido recomendado:

- título breve: `Nuevo mensaje`;
- nombre del usuario que inició el chat;
- título de la publicación;
- preview del primer mensaje si el backend lo entrega;
- imagen de la publicación como icono o bloque visual;
- botón `Ir al chat`.

Acción:

- navegar a `/mensajes/:chatId`.

Duración sugerida:

- entre 8 y 10 segundos.

Estilo:

- usar `sileo.action`;
- usar `description` con JSX para lograr una composición enriquecida similar al resultado visual del toast tipo promise;
- no usar `sileo.promise`, porque no existe una operación iniciada por el usuario con estados loading/success/error.

### 2. Mensaje nuevo en chat existente

No mostrar Sileo.

La interfaz debe:

- marcar el chat como no leído;
- mantener el indicador global en el ícono de mensajes;
- reordenar el chat al inicio de la lista usando `lastMessageAt`;
- destacar visualmente el chat en la lista.

Este comportamiento evita que el usuario reciba múltiples toasts por una conversación activa o por varios mensajes cortos seguidos.

### 3. Usuario viendo el chat activo

No mostrar Sileo.

La interfaz debe:

- insertar el mensaje en la conversación en tiempo real;
- llevar el scroll al último mensaje cuando corresponda;
- marcar el chat como leído.

### 4. Usuario en mensajes viendo otro chat

No mostrar Sileo.

La interfaz debe:

- actualizar la lista lateral;
- mover el chat con actividad reciente hacia arriba;
- marcarlo visualmente como pendiente.

### 5. Usuario fuera de mensajes

Si el evento es un chat nuevo:

- mostrar Sileo enriquecido.

Si el evento es un mensaje de chat existente:

- no mostrar Sileo;
- actualizar solo el indicador global de mensajes y el estado del chat.

## Reordenamiento

Todo chat con actividad nueva debe subir en la lista.

La prioridad de orden es:

1. `lastMessageAt`;
2. `updatedAt` como fallback.

Esto aplica tanto para chats nuevos como para mensajes nuevos en chats existentes.

## Sonido de notificación

Puede agregarse un sonido simple, pero debe seguir la misma política del toast:

- reproducir solo en chat nuevo;
- no reproducir por mensajes de chats existentes;
- usar un audio corto, suave y poco invasivo;
- evitar loops, sonidos largos o efectos fuertes;
- dejar el código preparado para poder desactivarlo después mediante preferencia de usuario.

Assets disponibles:

- `/sounds/chat-new.wav`: sonido activo por defecto;
- `/sounds/chat-new-soft-ping.wav`: variante suave recomendada;
- `/sounds/chat-new-warm-pop.wav`: variante más cálida;
- `/sounds/chat-new-bright-note.wav`: variante más notoria.

## Datos mínimos requeridos para el toast de chat nuevo

El evento realtime de chat nuevo debería entregar, directa o indirectamente:

- `chat.id`;
- `chat.postTitle`;
- `chat.postImage`;
- nombre del otro participante;
- `chat.lastMessage`;
- `chat.lastMessageAt`;
- `chat.isUnread`.

Si falta imagen de publicación, se puede usar un icono neutral de mensaje como fallback.

## Implementación sugerida

Ubicar la lógica global cerca de `ChatContext`, no dentro de `Messages.jsx`.

Motivo:

- `ChatContext` ya recibe eventos `chat.created` y `chat.updated` del canal del usuario;
- `Messages.jsx` solo debería encargarse de la experiencia interna de la pantalla de mensajes;
- la notificación global debe funcionar aunque el usuario esté en otra vista.

Reglas técnicas mínimas:

- ignorar eventos generados por el propio usuario si el payload permite detectarlo;
- no mostrar toast si el usuario ya está viendo el chat recién creado;
- mantener el orden de chats mediante `lastMessageAt`;
- evitar duplicados si Pusher entrega eventos repetidos.

## Resultado esperado

La experiencia final debe sentirse como una bandeja inteligente:

- un chat nuevo llama la atención con una notificación bonita y accionable;
- los mensajes nuevos de conversaciones existentes se reflejan sin interrumpir;
- el usuario conserva señales claras sin fatiga de notificaciones.
