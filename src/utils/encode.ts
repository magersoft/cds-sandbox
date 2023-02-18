/**
 * Encode a string to base64
 * @param data
 */
export function utoa(data: string): string {
  return btoa(unescape(encodeURIComponent(data)));
}

/**
 * Decode a base64 string
 * @param base64
 */
export function atou(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}
