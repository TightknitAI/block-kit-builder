import type { SupportedBlock } from '../../types';

/**
 * Common props for a per-block editor form.
 * The form is controlled: it never owns state beyond the block payload.
 */
export interface BlockEditorProps<TBlock extends SupportedBlock> {
  block: TBlock;
  onChange: (next: TBlock) => void;
}
