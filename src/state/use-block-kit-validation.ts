import { validateBlockKit } from '@tightknitai/slack-block-kit-validator';
import { useEffect, useState } from 'react';
import { type GroupedErrors, groupValidatorErrors, toValidatorSurface } from '../lib/error-grouping';
import { toSlackBlocks } from '../lib/to-slack-blocks';
import type { BuilderBlock, PreviewSurface } from '../types';

/**
 * Debounce delay between the latest edit and the next validation pass.
 * Short enough to feel live; long enough to avoid running the AJV
 * compiled validator on every keystroke.
 */
const DEBOUNCE_MS = 150;

/**
 * Result returned by {@link useBlockKitValidation}.
 */
export interface ValidationState extends GroupedErrors {
  /** True iff there are zero errors after the most recent run. */
  valid: boolean;
}

/**
 * Continuously validates the working draft against
 * {@link validateBlockKit}, scoped to the current preview surface.
 * Debounced so rapid edits don't thrash the AJV compiled validator.
 *
 * @param blocks - current builder blocks (id + payload)
 * @param surface - the preview surface (drives surface-compatibility checks)
 * @returns the current validation state, grouped by block id
 */
export function useBlockKitValidation(blocks: BuilderBlock[], surface: PreviewSurface): ValidationState {
  const [state, setState] = useState<ValidationState>(() => ({
    valid: true,
    byBlockId: new Map(),
    general: [],
    total: 0
  }));

  useEffect(() => {
    const handle = setTimeout(() => {
      const payload = toSlackBlocks(blocks.map((b) => b.block));
      const result = validateBlockKit(payload, {
        target: 'blocks',
        surface: toValidatorSurface(surface)
      });
      const grouped = groupValidatorErrors(result.errors, blocks);
      setState({
        valid: result.valid,
        byBlockId: grouped.byBlockId,
        general: grouped.general,
        total: grouped.total
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [blocks, surface]);

  return state;
}
