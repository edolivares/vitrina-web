let chatNotificationAudio = null;

/**
 * Reproduce el sonido discreto asociado a la llegada de un chat nuevo.
 *
 * El elemento Audio se reutiliza entre llamadas para evitar recrearlo por cada evento realtime.
 * Si el navegador bloquea la reproducción automática, el error se ignora porque el toast visual
 * sigue siendo la señal principal para el usuario.
 *
 * @returns {void}
 */
export const playChatNotificationSound = () => {
  if (typeof window === 'undefined') return;

  if (!chatNotificationAudio) {
    chatNotificationAudio = new Audio('/sounds/chat-new.wav');
    chatNotificationAudio.preload = 'auto';
    chatNotificationAudio.volume = 0.42;
  }

  chatNotificationAudio.currentTime = 0;
  const playResult = chatNotificationAudio.play();

  if (playResult?.catch) {
    playResult.catch(() => {
      // Browsers can block audio until the user interacts with the page.
    });
  }
};
