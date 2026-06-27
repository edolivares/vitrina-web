import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merges conditional class values and resolves Tailwind utility conflicts.
 *
 * @param {...import("clsx").ClassValue} inputs - Class values accepted by clsx.
 * @returns {string} Merged className string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
