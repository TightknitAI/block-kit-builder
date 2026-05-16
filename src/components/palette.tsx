import { useDraggable } from '@dnd-kit/core';
import {
  AlertTriangle,
  AlignLeft,
  ChevronRight,
  CreditCard,
  FileText,
  GalleryHorizontal,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  Info,
  MessageSquareMore,
  Minus,
  MousePointerClick,
  Pilcrow,
  Table as TableIcon,
  TextCursorInput
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../lib/cn';
import { PALETTE_SECTIONS, type PaletteVariant } from '../lib/default-blocks';
import type { SupportedBlock, SupportedBlockType } from '../types';

const SECTION_ICONS: Record<SupportedBlockType, ComponentType<SVGProps<SVGSVGElement>>> = {
  section: AlignLeft,
  header: Heading1,
  divider: Minus,
  context: Info,
  actions: MousePointerClick,
  image: ImageIcon,
  markdown: FileText,
  rich_text: Pilcrow,
  table: TableIcon,
  alert: AlertTriangle,
  card: CreditCard,
  carousel: GalleryHorizontal,
  context_actions: MessageSquareMore,
  input: TextCursorInput
};

/**
 * The DnD draggable id format for palette items, e.g. `palette:section_mrkdwn`.
 * The drop target parses the prefix to know "this is a new block being added"
 * and then resolves the suffix to the appropriate variant factory.
 */
export const PALETTE_DRAG_PREFIX = 'palette:';

/**
 * Checks whether a DnD draggable id refers to a palette item, returning
 * the variant id when it does.
 * @param id - the draggable id from a DnD event
 * @returns the variant id if the drag started in the palette, else null
 */
export function parsePaletteDragId(id: string | number): string | null {
  if (typeof id !== 'string' || !id.startsWith(PALETTE_DRAG_PREFIX)) {
    return null;
  }
  return id.slice(PALETTE_DRAG_PREFIX.length);
}

/**
 * The left-side palette of available block variants, organized into
 * sections that mirror Slack's real Block Kit Builder ("Section", "Header",
 * "Divider", "Image", "Context", "Actions"). Each variant is a draggable
 * preset that inserts a default-shaped block when dropped on the surface.
 * @param props - palette props
 * @param props.onAddBlock - called when a palette item is added via its
 *   chevron button (appends the block to the bottom of the preview)
 * @param props.allowedBlockTypes - if provided, restricts the palette to
 *   sections whose block type is in the list. When omitted, every section
 *   is rendered.
 * @returns the rendered palette aside
 */
export function Palette({
  onAddBlock,
  allowedBlockTypes
}: {
  onAddBlock: (block: SupportedBlock) => void;
  allowedBlockTypes?: readonly SupportedBlockType[];
}) {
  const sections = allowedBlockTypes
    ? PALETTE_SECTIONS.filter((s) => allowedBlockTypes.includes(s.blockType))
    : PALETTE_SECTIONS;

  return (
    <aside className="flex min-h-0 w-60 shrink-0 flex-col overflow-y-auto border-r bg-muted/20 p-3">
      {sections.map((section) => {
        const Icon = SECTION_ICONS[section.blockType];
        return (
          <div key={section.name} className="mt-4 flex flex-col first:mt-0">
            <div className="flex items-center gap-1.5 px-1 pb-1.5">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{section.name}</span>
            </div>
            {section.variants.map((variant) => (
              <PaletteItem key={variant.id} variant={variant} onAdd={() => onAddBlock(variant.factory())} />
            ))}
          </div>
        );
      })}
    </aside>
  );
}

/**
 * One draggable palette row. Hover surfaces a chevron button that
 * appends the variant's block to the preview without dragging.
 * @param props - item props
 * @param props.variant - the block variant this row represents
 * @param props.onAdd - called when the chevron button is clicked
 * @returns the rendered palette row
 */
function PaletteItem({ variant, onAdd }: { variant: PaletteVariant; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${PALETTE_DRAG_PREFIX}${variant.id}`
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex cursor-grab items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{variant.label}</span>
      <button
        type="button"
        aria-label={`Add ${variant.label} to preview`}
        onClick={onAdd}
        onPointerDown={(e) => e.stopPropagation()}
        className="ml-auto flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border border-transparent text-muted-foreground opacity-0 transition-opacity hover:border-border hover:bg-background hover:text-foreground group-hover:opacity-100"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
