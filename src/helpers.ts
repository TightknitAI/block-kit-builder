/**
 * Headless helper subpath: `@tightknitai/block-kitchen/helpers`.
 *
 * Re-exports the framework-agnostic helpers from this package without
 * dragging in the React component tree. Useful for backend code (e.g.
 * a Worker that round-trips a draft and posts to Slack) that only
 * needs to sanitize blocks or encode/decode draft state.
 */
export { toSlackBlocks } from './lib/to-slack-blocks';
export { decodeBlocksFromString, encodeBlocksToString } from './lib/url-state';
export type { SupportedBlock, SupportedBlockType } from './types';
