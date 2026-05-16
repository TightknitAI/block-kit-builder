import type { SupportedBlock } from '../types';

/**
 * Upper bound on the encoded string length we accept on decode. Block
 * Kit JSON in practice is well under 100 KB; we cap at 1 MiB of encoded
 * input so a pathologically large URL hash cannot freeze the tab in
 * `atob` + `JSON.parse` before the validator gets a look. Encoded
 * (base64url) is ~33% larger than the binary, so this bounds the decoded
 * JSON at roughly 768 KiB.
 */
const MAX_ENCODED_BYTES = 1024 * 1024;

/**
 * Encodes a block list to a base64url string suitable for use as a URL
 * search param. The consumer chooses where to put it (search param, hash,
 * localStorage, etc).
 * Returns an empty string for an empty list so the consumer can omit the
 * param entirely.
 * @param blocks - the blocks to encode
 * @returns base64url-encoded JSON, or '' if blocks is empty
 */
export function encodeBlocksToString(blocks: SupportedBlock[]): string {
  if (blocks.length === 0) {
    return '';
  }
  const json = JSON.stringify(blocks);
  const utf8Bytes = new TextEncoder().encode(json);
  const chars = new Array<string>(utf8Bytes.length);
  for (let i = 0; i < utf8Bytes.length; i++) {
    chars[i] = String.fromCharCode(utf8Bytes[i]);
  }
  return toBase64Url(btoa(chars.join('')));
}

/**
 * Decodes a string produced by {@link encodeBlocksToString} back to a
 * block list. Returns null on any decode/parse error.
 * @param encoded - the encoded string
 * @returns decoded blocks, or null if input is empty/invalid
 */
export function decodeBlocksFromString(encoded: string | undefined | null): SupportedBlock[] | null {
  if (!encoded) {
    return null;
  }
  if (encoded.length > MAX_ENCODED_BYTES) {
    return null;
  }
  try {
    const binary = atob(fromBase64Url(encoded));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed as SupportedBlock[];
  } catch {
    return null;
  }
}

/**
 * Converts a standard base64 string to base64url (URL-safe alphabet, no padding).
 * @param b64 - standard base64-encoded string
 * @returns the base64url-encoded equivalent
 */
function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a base64url string back to standard base64 with padding restored.
 * @param b64url - base64url-encoded string
 * @returns the standard base64 equivalent
 */
function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (b64.length % 4)) % 4;
  return b64 + '='.repeat(padLen);
}
