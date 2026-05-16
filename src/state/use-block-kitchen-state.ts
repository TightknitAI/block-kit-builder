import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BuilderBlock, SupportedBlock } from '../types';

/**
 * Wraps a Slack block payload in a {@link BuilderBlock} with a fresh client id.
 * @param block - the underlying Slack block payload
 * @returns a builder-side block with id
 */
function wrap(block: SupportedBlock): BuilderBlock {
  return { id: nanoid(8), block };
}

/**
 * Reactive state for the builder's working draft.
 *
 * - `blocks`: ordered list of {@link BuilderBlock} (id + payload).
 * - Mutators (`addBlock`, `removeBlock`, etc.) operate on ids, not indices.
 * - On any change, calls the optional `onChange` with the unwrapped Slack
 *   payloads so the consumer can persist (URL, localStorage, etc).
 * @param params - hook params
 * @param params.initialBlocks - starting payloads
 * @param params.onChange - notified on any state change with Slack payloads
 * @returns state slice + mutators
 */
export function useBlockKitchenState({
  initialBlocks,
  onChange
}: {
  initialBlocks?: SupportedBlock[];
  onChange?: (blocks: SupportedBlock[]) => void;
} = {}) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() => (initialBlocks ?? []).map(wrap));

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const isFirstRunRef = useRef(true);
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    onChangeRef.current?.(blocks.map((b) => b.block));
  }, [blocks]);

  const addBlock = useCallback((block: SupportedBlock, atIndex?: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const inserted = wrap(block);
      const idx = atIndex === undefined ? next.length : Math.max(0, Math.min(atIndex, next.length));
      next.splice(idx, 0, inserted);
      return next;
    });
  }, []);

  const updateBlock = useCallback((id: string, block: SupportedBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, block } : b)));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) {
        return prev;
      }
      const source = prev[idx];
      const next = [...prev];
      next.splice(idx + 1, 0, wrap(structuredClone(source.block)));
      return next;
    });
  }, []);

  const reorderBlock = useCallback((fromId: string, toIndex: number) => {
    setBlocks((prev) => {
      const fromIndex = prev.findIndex((b) => b.id === fromId);
      if (fromIndex === -1) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      const clamped = Math.max(0, Math.min(toIndex, next.length));
      next.splice(clamped, 0, moved);
      return next;
    });
  }, []);

  const replaceAll = useCallback((newBlocks: SupportedBlock[]) => {
    setBlocks(newBlocks.map(wrap));
  }, []);

  return {
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    duplicateBlock,
    reorderBlock,
    replaceAll
  };
}
