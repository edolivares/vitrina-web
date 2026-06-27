/**
 * Formats a numeric value as Chilean pesos without decimal places.
 *
 * @param {number} value - Amount to format.
 * @returns {string} Localized CLP currency string.
 */
export function formatPrice(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats a date as a long month and year in Chilean Spanish.
 *
 * @param {string | number | Date} dateValue - Date value accepted by the Date constructor.
 * @returns {string} Localized month and year, for example "mayo de 2024".
 */
export function formatMonthYear(dateValue) {
  return new Date(dateValue).toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats a date using the default Chilean Spanish date style.
 *
 * @param {string | number | Date} dateValue - Date value accepted by the Date constructor.
 * @returns {string} Localized date string.
 */
export function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('es-CL');
}

/**
 * Formats a date as a short hour and minute in Chilean Spanish.
 *
 * @param {string | number | Date} dateValue - Date value accepted by the Date constructor.
 * @returns {string} Localized time string with two-digit hour and minute.
 */
export function formatTime(dateValue) {
  return new Date(dateValue).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date as a relative publication time.
 *
 * @param {string | number | Date} dateValue - Date value accepted by the Date constructor.
 * @returns {string} Relative time label, for example "Hace 6 horas".
 */
export function formatRelativeTime(dateValue) {
  const now = Date.now();
  const date = new Date(dateValue);
  const diffHours = Math.floor((now - date.getTime()) / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Hace unos momentos';
  if (diffHours === 1) return 'Hace 1 hora';
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Hace 1 día';
  return `Hace ${diffDays} días`;
}
