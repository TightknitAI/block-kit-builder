import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { useCallback, useState } from 'react';
import { VARIANT_BY_ID } from '../lib/default-blocks';
import { TooltipProvider } from '../lib/ui/tooltip';
import { useBlockKitBuilderState } from '../state/use-block-kit-builder-state';
import { useBlockKitValidation } from '../state/use-block-kit-validation';
import type { BlockKitBuilderProps, PreviewSurface, PreviewTheme } from '../types';
import { IssuesSheet } from './issues-sheet';
import { JsonDrawer } from './json-drawer';
import { Palette, parsePaletteDragId } from './palette';
import { SendDialog } from './send-dialog';
import { SURFACE_DROPPABLE_ID, Surface } from './surface';
import { Toolbar } from './toolbar';

/**
 * Top-level Slack Block Kit builder component.
 * Renders the toolbar, palette, preview surface, popover editors, send
 * dialog, and View-JSON drawer. Integration-agnostic: all I/O is brokered
 * through props.
 * @param props - {@link BlockKitBuilderProps}
 * @returns the rendered Block Kit Builder
 */
export function BlockKitBuilder(props: BlockKitBuilderProps) {
  const {
    workspaceName,
    initialBlocks,
    onChange,
    previewHooks,
    loadChannels,
    loadSendAsUserStatus,
    onSend,
    allowedBlockTypes,
    allowedSurfaces: allowedSurfacesProp,
    showThemeControl = true,
    defaultPreviewTheme = 'light'
  } = props;

  // Default to message-only when omitted (or passed empty). The toolbar
  // needs at least one entry to seed `previewSurface`; it hides the
  // dropdown when this resolves to a single surface.
  const allowedSurfaces: readonly PreviewSurface[] =
    allowedSurfacesProp && allowedSurfacesProp.length > 0 ? allowedSurfacesProp : ['message'];

  const { blocks, addBlock, updateBlock, removeBlock, duplicateBlock, reorderBlock, replaceAll } =
    useBlockKitBuilderState({ initialBlocks, onChange });

  const [jsonOpen, setJsonOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>(defaultPreviewTheme);
  const [previewSurface, setPreviewSurface] = useState<PreviewSurface>(allowedSurfaces[0]);
  const [activePaletteVariantId, setActivePaletteVariantId] = useState<string | null>(null);

  // Always validate against the `message` surface: that's where Send posts
  // to. If we scoped validation to the preview surface, a user could switch
  // to `modal`, drop in modal-only blocks, see `errorCount === 0`, and have
  // Send accept a payload Slack will reject.
  const validation = useBlockKitValidation(blocks, 'message');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const variantId = parsePaletteDragId(event.active.id);
    setActivePaletteVariantId(variantId);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActivePaletteVariantId(null);
      const { active, over } = event;
      if (!over) {
        return;
      }

      const variantId = parsePaletteDragId(active.id);
      if (variantId) {
        const variant = VARIANT_BY_ID.get(variantId);
        if (!variant) {
          return;
        }
        const targetIndex =
          over.id === SURFACE_DROPPABLE_ID ? blocks.length : blocks.findIndex((b) => b.id === over.id);
        addBlock(variant.factory(), targetIndex === -1 ? undefined : targetIndex);
        return;
      }

      if (active.id !== over.id) {
        const overIndex = blocks.findIndex((b) => b.id === over.id);
        if (overIndex !== -1) {
          reorderBlock(active.id as string, overIndex);
        }
      }
    },
    [addBlock, blocks, reorderBlock]
  );

  const handleDragCancel = useCallback(() => {
    setActivePaletteVariantId(null);
  }, []);

  const activePaletteVariant = activePaletteVariantId ? VARIANT_BY_ID.get(activePaletteVariantId) : null;

  const blockPayloads = blocks.map((b) => b.block);

  return (
    <TooltipProvider delayDuration={200}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="bkb-root flex h-full w-full flex-col rounded-md border bg-background text-foreground">
          <Toolbar
            onClear={() => replaceAll([])}
            onOpenJson={() => setJsonOpen(true)}
            onOpenIssues={() => setIssuesOpen(true)}
            onOpenSend={() => setSendOpen(true)}
            canSend={blocks.length > 0}
            canClear={blocks.length > 0}
            errorCount={validation.total}
            previewTheme={previewTheme}
            onPreviewThemeChange={setPreviewTheme}
            previewSurface={previewSurface}
            onPreviewSurfaceChange={setPreviewSurface}
            allowedSurfaces={allowedSurfaces}
            showThemeControl={showThemeControl}
          />
          <div className="flex min-h-0 flex-1 items-stretch">
            <Palette onAddBlock={(block) => addBlock(block)} allowedBlockTypes={allowedBlockTypes} />
            <Surface
              blocks={blocks}
              workspaceName={workspaceName}
              previewHooks={previewHooks}
              previewTheme={previewTheme}
              previewSurface={previewSurface}
              errorsByBlockId={validation.byBlockId}
              openBlockId={openBlockId}
              onOpenBlockChange={setOpenBlockId}
              onUpdate={updateBlock}
              onDuplicate={duplicateBlock}
              onDelete={removeBlock}
            />
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activePaletteVariant ? (
            <div className="flex items-center gap-1.5 rounded border bg-background px-1.5 py-1 text-xs text-foreground shadow-md">
              <GripVertical className="h-3 w-3 shrink-0" />
              <span className="truncate">{activePaletteVariant.label}</span>
            </div>
          ) : null}
        </DragOverlay>
        <JsonDrawer open={jsonOpen} onOpenChange={setJsonOpen} blocks={blockPayloads} onApply={replaceAll} />
        <SendDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          blocks={blockPayloads}
          loadChannels={loadChannels}
          loadSendAsUserStatus={loadSendAsUserStatus}
          onSend={onSend}
          errorCount={validation.total}
          onShowIssues={() => {
            setSendOpen(false);
            setIssuesOpen(true);
          }}
        />
        <IssuesSheet
          open={issuesOpen}
          onOpenChange={setIssuesOpen}
          blocks={blocks}
          validation={validation}
          onJumpToBlock={(id) => setOpenBlockId(id)}
        />
      </DndContext>
    </TooltipProvider>
  );
}
