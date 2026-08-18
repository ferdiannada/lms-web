/**
 * Security utilities for input sanitization and safe URL handling.
 */

// Explicitly dangerous schemes and control character patterns
const DANGEROUS_PROTOCOLS = /^(javascript|vbscript|data|file):/i;
const PROTOCOL_RELATIVE_PATTERN = /^(\/\/|\\\\)/;

/**
 * Validates and sanitizes a URL to prevent DOM XSS and open redirect attacks.
 * Only http:, https:, mailto:, tel:, or root-relative paths (/...) are permitted.
 *
 * @param url The raw URL string
 * @param fallback Optional fallback if invalid (default: '#')
 * @returns Safe URL string
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return '';
  
  // Remove ASCII control characters and whitespace
  // eslint-disable-next-line no-control-regex
  const cleaned = url.replace(/[\x00-\x1F\x7F-\x9F\s]+/g, '').trim();
  if (!cleaned) return fallback;

  // Block protocol-relative URLs (e.g. //evil.com)
  if (PROTOCOL_RELATIVE_PATTERN.test(cleaned)) {
    return fallback;
  }

  // Block dangerous pseudo-protocols
  if (DANGEROUS_PROTOCOLS.test(cleaned)) {
    return fallback;
  }

  // Safe schemes or single-slash relative path
  if (
    cleaned.startsWith('https://') ||
    cleaned.startsWith('http://') ||
    cleaned.startsWith('mailto:') ||
    cleaned.startsWith('tel:') ||
    (cleaned.startsWith('/') && !cleaned.startsWith('//')) ||
    cleaned.startsWith('./') ||
    cleaned.startsWith('../')
  ) {
    return cleaned;
  }

  // If no protocol is present and doesn't contain a colon, treat as relative path
  if (!cleaned.includes(':')) {
    return cleaned;
  }

  return fallback;
}

/**
 * Checks whether a URL is considered safe for navigation or opening.
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  // eslint-disable-next-line no-control-regex
  const cleaned = url.replace(/[\x00-\x1F\x7F-\x9F\s]+/g, '').trim();
  if (!cleaned || PROTOCOL_RELATIVE_PATTERN.test(cleaned) || DANGEROUS_PROTOCOLS.test(cleaned)) {
    return false;
  }

  return (
    cleaned.startsWith('https://') ||
    cleaned.startsWith('http://') ||
    cleaned.startsWith('mailto:') ||
    cleaned.startsWith('tel:') ||
    (cleaned.startsWith('/') && !cleaned.startsWith('//')) ||
    cleaned.startsWith('./') ||
    cleaned.startsWith('../') ||
    !cleaned.includes(':')
  );
}
