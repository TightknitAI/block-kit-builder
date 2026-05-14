import type { SupportedBlock } from '../types';

/**
 * Strip builder-only fields from blocks so they conform to Slack's
 * Block Kit schema. Currently removes the cosmetic `level` field from
 * header blocks, which is a builder-only extension that the validator
 * (and Slack's API) would otherwise reject.
 * @param blocks - the working draft blocks
 * @returns blocks with builder-only fields removed
 */
export function toSlackBlocks(blocks: SupportedBlock[]): SupportedBlock[] {
  return blocks.map((block) => {
    if (block.type === 'header' && 'level' in block) {
      const { level: _omit, ...rest } = block;
      return rest;
    }
    return block;
  });
}
