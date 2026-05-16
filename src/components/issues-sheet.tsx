import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { labelForBlockType } from '../lib/default-blocks';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../lib/ui/sheet';
import type { ValidationState } from '../state/use-block-kit-validation';
import type { BuilderBlock, SupportedBlockType } from '../types';

/**
 * Side panel listing every validation error for the current draft,
 * grouped by block (and a "General" bucket for cross-block / root issues).
 * Clicking an entry asks the parent to focus + open the matching block's
 * popover editor.
 * @param props - sheet props
 * @param props.open - whether the sheet is open
 * @param props.onOpenChange - notified when the user closes the sheet
 * @param props.blocks - current builder blocks (used to label entries)
 * @param props.validation - validation state from {@link useBlockKitValidation}
 * @param props.onJumpToBlock - called when the user clicks a block entry
 * @returns the rendered issues sheet
 */
export function IssuesSheet({
  open,
  onOpenChange,
  blocks,
  validation,
  onJumpToBlock
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: BuilderBlock[];
  validation: ValidationState;
  onJumpToBlock?: (id: string) => void;
}) {
  const blockEntries = blocks
    .map((block, idx) => {
      const errors = validation.byBlockId.get(block.id);
      if (!errors || errors.length === 0) {
        return null;
      }
      return { block, idx, errors };
    })
    .filter(Boolean) as {
    block: BuilderBlock;
    idx: number;
    errors: string[];
  }[];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-full flex-col gap-3 sm:max-w-md">
        <div className="flex flex-col gap-1">
          <SheetTitle className="flex items-center gap-2">
            {validation.total === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {validation.total === 0
              ? 'No issues'
              : `${validation.total} ${validation.total === 1 ? 'issue' : 'issues'}`}
          </SheetTitle>
          <SheetDescription>Validation runs against the chosen Slack surface as you edit.</SheetDescription>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {validation.total === 0 ? (
            <p className="text-xs text-muted-foreground">Your draft is valid for the current surface.</p>
          ) : null}

          {validation.general.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">General</p>
              <ul className="flex flex-col gap-1 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                {validation.general.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {blockEntries.map(({ block, idx, errors }) => {
            const label = labelForBlockType(block.block.type as SupportedBlockType);
            return (
              <div key={block.id} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToBlock?.(block.id);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between rounded-md border bg-muted/30 px-2 py-1.5 text-left text-xs font-medium text-foreground hover:border-primary/40 hover:bg-accent"
                >
                  <span>
                    Block {idx + 1}: {label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{errors.length}</span>
                </button>
                <ul className="flex flex-col gap-1 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
