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

// --- URL-safe compressed encoding for share links ---
// It produces smaller strings than plain base64(JSON).
// Stored format: LZ-based compression with a URL-safe alphabet.
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

/**
 * Compress a UTF-16 string to a URL-safe string.
 *
 * Note: output is already URI-safe (no need for encodeURIComponent).
 */
export function compressToUrlSafeString(data: string): string {
  return compressToEncodedURIComponent(data);
}

/**
 * Decompress a URL-safe string back to the original string.
 * Returns null if data is not valid/decodable.
 */
export function decompressFromUrlSafeString(data: string): string | null {
  return decompressFromEncodedURIComponent(data);
}
