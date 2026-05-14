import type { Surface } from 'slack-block-kit-validator';
import type { BuilderBlock, PreviewSurface } from '../types';

/**
 * Result of grouping a flat validator error list into builder buckets.
 */
export interface GroupedErrors {
  /** All errors keyed by builder block id. Buckets without errors are absent. */
  byBlockId: Map<string, string[]>;
  /** Errors that don't map to a specific block (root-level, cross-block, etc). */
  general: string[];
  /** Total count across both buckets. */
  total: number;
}

/**
 * Maps the builder's {@link PreviewSurface} (which uses `app_home`) to the
 * validator's {@link Surface} (which uses `home`).
 * @param surface - the builder's surface value
 * @returns the validator-compatible surface
 */
export function toValidatorSurface(surface: PreviewSurface): Surface {
  return surface === 'app_home' ? 'home' : surface;
}

/**
 * Returns the leading `/N/...` path segment from a JSON-pointer-style
 * instance path as a numeric block index, or null if the path doesn't
 * start with one.
 * @param path - a JSON-pointer style path from the validator
 * @returns the index, or null when the path is general or malformed
 */
function extractBlockIndex(path: string): number | null {
  if (!path || path === '(root)') {
    return null;
  }
  const match = /^\/(\d+)(?:\/|$)/.exec(path);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

/**
 * Strips the leading `/N` segment from an instance path so the message
 * shown next to a block doesn't redundantly repeat the block index.
 * @param path - the original instance path
 * @returns the path without the leading `/N` segment
 */
function stripBlockPrefix(path: string): string {
  return path.replace(/^\/\d+/, '') || '(root)';
}

/**
 * Splits a flat array of validator error strings (each in the form
 * "<instancePath> <message>") into per-block buckets keyed by the
 * matching {@link BuilderBlock.id}, plus a general bucket for anything
 * not tied to a single block.
 * @param errors - flat error list from `validateBlockKit`
 * @param blocks - the builder blocks in the same order as the validated payload
 * @returns the grouped error buckets
 */
export function groupValidatorErrors(errors: readonly string[], blocks: readonly BuilderBlock[]): GroupedErrors {
  const byBlockId = new Map<string, string[]>();
  const general: string[] = [];

  for (const raw of errors) {
    // Validator emits "<path> <message>". Path may be "(root)" or "/0/..." etc.
    const space = raw.indexOf(' ');
    const path = space === -1 ? '(root)' : raw.slice(0, space);
    const message = space === -1 ? raw : raw.slice(space + 1);

    const idx = extractBlockIndex(path);
    if (idx === null || idx >= blocks.length) {
      general.push(raw);
      continue;
    }

    const id = blocks[idx].id;
    const friendly = formatMessage(stripBlockPrefix(path), message);
    const bucket = byBlockId.get(id) ?? [];
    bucket.push(friendly);
    byBlockId.set(id, bucket);
  }

  return { byBlockId, general, total: errors.length };
}

/**
 * Lightly humanizes a validator message by prepending the relative path
 * when it adds useful context.
 * @param relativePath - the path within a block
 * @param message - the validator's message
 * @returns a single-line user-facing message
 */
function formatMessage(relativePath: string, message: string): string {
  if (relativePath === '' || relativePath === '(root)') {
    return message;
  }
  return `${relativePath}: ${message}`;
}
