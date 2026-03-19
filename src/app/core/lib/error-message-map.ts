import APPLICATION_CONSTANTS from '../application-constants/application-constants';

const AC = APPLICATION_CONSTANTS;

/**
 * Maps API/server error strings to user-friendly messages.
 * Uses case-insensitive includes() to match Svelte implementation.
 * Use when displaying errors from fetch/catch (fromServer=false).
 * When fromServer=true, show the raw message as-is.
 */

/**
 * Normalizes any error value to a displayable string.
 * Handles: string, Error, objects with message property, and [object Object].
 * Use when returning { error } from API modules or displaying errors.
 */
export function normalizeErrorToString(
  err: unknown,
  fallback = AC.ERROR_FALLBACK,
): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  )
    return (err as { message: string }).message;
  const str = String(err ?? '');
  return str === '[object Object]' ? fallback : str;
}

export function toUserFriendlyError(raw: unknown): string {
  const str = normalizeErrorToString(raw, AC.ERROR_UNKNOWN);
  const lower = str.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('load failed') ||
    lower.includes('networkerror')
  )
    return AC.ERROR_NETWORK;
  if (lower.includes('not found') || lower.includes('404'))
    return AC.ERROR_NOT_FOUND;
  if (lower.includes('500') || lower.includes('internal server error'))
    return AC.ERROR_SERVER;
  if (
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('aborted')
  )
    return AC.ERROR_TIMEOUT;
  if (lower.includes('cors') || lower.includes('cross-origin'))
    return AC.ERROR_CORS;
  if (
    lower.includes('unexpected end of json') ||
    (lower.includes('json') && lower.includes('unexpected'))
  )
    return AC.ERROR_SERVER_UNREACHABLE;
  return str;
}
