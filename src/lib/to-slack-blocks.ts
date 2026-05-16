import type { SupportedBlock } from '../types';
import { sanitizeBlock } from './sanitize-blocks';

/**
 * Strip builder-only fields from blocks so they conform to Slack's
 * Block Kit schema, and scrub dangerous URI schemes from any
 * `url`/`image_url` fields. Currently removes the cosmetic `level`
 * field from header blocks (a builder-only extension Slack would
 * reject) and routes every URL/image-url through the allowlist in
 * `lib/url-safety.ts` so a payload that round-trips through the
 * builder cannot carry `javascript:`/`data:text/html` URIs to a
 * downstream consumer or to the Slack API.
 * @param blocks - the working draft blocks
 * @returns blocks with builder-only fields removed and URLs scrubbed
 */
export function toSlackBlocks(blocks: SupportedBlock[]): SupportedBlock[] {
  return blocks.map((block) => {
    const safe = sanitizeBlock(block);
    if (safe.type === 'header' && 'level' in safe) {
      const { level: _omit, ...rest } = safe;
      return rest as SupportedBlock;
    }
    return safe;
  });
}
