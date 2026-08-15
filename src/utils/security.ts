/**
 * Security utilities for input sanitization and safe URL handling.
 */

const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:|tel:|\/|\.\/|\.\.\/)/i;
const DANGEROUS_PROTOCOLS = /^(javascript:|data:|vbscript:)/i;

/**
 * Validates and sanitizes a URL to prevent DOM XSS via malicious pseudo-protocols like javascript:.
 * Only http:, https:, mailto:, tel:, or relative paths are permitted.
 *
 * @param url The raw URL string
 * @param fallback Optional fallback if invalid (default: '#')
 * @returns Safe URL string
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Explicitly block dangerous protocols
  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return fallback;
  }

  // Must match safe protocol or relative root
  if (SAFE_URL_PATTERN.test(trimmed) || !trimmed.includes(':')) {
    return trimmed;
  }

  return fallback;
}

/**
 * Checks whether a URL is considered safe for navigation/opening.
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (DANGEROUS_PROTOCOLS.test(trimmed)) return false;
  return SAFE_URL_PATTERN.test(trimmed) || !trimmed.includes(':');
}
