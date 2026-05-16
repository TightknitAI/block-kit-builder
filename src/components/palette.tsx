import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, GripVertical, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import type { PaletteSection as PaletteSectionDef, PaletteVariant } from '../lib/default-blocks';
import { Input } from '../lib/ui/input';
import type { SupportedBlock } from '../types';

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
 * Configuration for which palette sections are open on first paint.
 * - `true` (default) → every section starts open
 * - `false` → every section starts closed
 * - array of section names → only sections whose `name` is in the list start open
 *
 * Matched by `section.name` (case-sensitive) so consumer-defined sections
 * are addressable too — a consumer with custom palette like `[{ name:
 * 'Company presets', ... }]` can pass `['Company presets']` to start that
 * one open.
 */
export type DefaultOpenSections = boolean | readonly string[];

function isDefaultOpen(sectionName: string, config: DefaultOpenSections): boolean {
  if (typeof config === 'boolean') return config;
  return config.includes(sectionName);
}

function filterSections(sections: readonly PaletteSectionDef[], query: string): readonly PaletteSectionDef[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return sections;
  const out: PaletteSectionDef[] = [];
  for (const section of sections) {
    if (section.name.toLowerCase().includes(q)) {
      out.push(section);
      continue;
    }
    const variants = section.variants.filter((v) => v.label.toLowerCase().includes(q));
    if (variants.length > 0) {
      out.push({ ...section, variants });
    }
  }
  return out;
}

/**
 * The left-side palette of available block variants, organized into
 * collapsible sections that mirror Slack's real Block Kit Builder
 * (Agents, Markdown, Section, Actions, Input, Structure, Rich Text,
 * Image, Card and Carousel, Table). Each variant is a draggable preset
 * that inserts a default-shaped block when dropped on the surface. A
 * search input at the top filters variants by label across all sections;
 * an active query temporarily expands every matching section regardless
 * of its collapsed state.
 * @param props - palette props
 * @param props.onAddBlock - called when a palette item is added via its
 *   chevron button (appends the block to the bottom of the preview)
 * @param props.sections - the palette sections to render (the resolved
 *   palette, either the built-in default or a consumer-provided one)
 * @param props.defaultOpenSections - controls which section headers are
 *   expanded on first mount. See {@link DefaultOpenSections}. Defaults to
 *   `true` (all open).
 * @param props.showSearch - whether the quick-search input is rendered
 *   above the section list. Defaults to `true`. Set `false` for compact
 *   palettes where the list is short enough to scan by eye.
 * @param props.searchPlaceholder - placeholder text shown in the search
 *   input. Defaults to `'Search blocks…'`. Useful for localization.
 * @returns the rendered palette aside
 */
export function Palette({
  onAddBlock,
  sections,
  defaultOpenSections = true,
  showSearch = true,
  searchPlaceholder = 'Search blocks…'
}: {
  onAddBlock: (block: SupportedBlock) => void;
  sections: readonly PaletteSectionDef[];
  defaultOpenSections?: DefaultOpenSections;
  showSearch?: boolean;
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState('');
  const visibleSections = useMemo(
    () => (showSearch ? filterSections(sections, query) : sections),
    [sections, query, showSearch]
  );
  const queryActive = showSearch && query.trim().length > 0;

  return (
    <aside className="flex min-h-0 w-72 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r bg-muted/20">
      {showSearch ? (
        <div className="sticky top-0 z-10 border-b bg-muted/20 px-3 pt-3 pb-2 backdrop-blur">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-8 pl-7 text-sm"
            />
          </div>
        </div>
      ) : null}
      <div className="flex flex-col p-3">
        {visibleSections.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">No blocks match.</p>
        ) : (
          visibleSections.map((section) => (
            <PaletteSection
              key={section.name}
              section={section}
              defaultOpen={isDefaultOpen(section.name, defaultOpenSections)}
              forceOpen={queryActive}
              onAddBlock={onAddBlock}
            />
          ))
        )}
      </div>
    </aside>
  );
}

/**
 * One collapsible category in the palette. Owns its own open/closed
 * state, seeded from `defaultOpen`. When `forceOpen` is true (an active
 * search) it renders expanded regardless of the local state, and the
 * prior state is restored once the search clears.
 */
function PaletteSection({
  section,
  defaultOpen,
  forceOpen,
  onAddBlock
}: {
  section: PaletteSectionDef;
  defaultOpen: boolean;
  forceOpen: boolean;
  onAddBlock: (block: SupportedBlock) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  const isOpen = open || forceOpen;
  const Caret = isOpen ? ChevronDown : ChevronRight;

  return (
    <div className="mt-3 flex flex-col first:mt-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer appearance-none items-center gap-1.5 rounded border-0 bg-transparent px-1 py-1 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">{section.name}</span>
        <Caret className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {isOpen ? (
        <div className="mt-0.5 flex flex-col">
          {section.variants.map((variant) => (
            <PaletteItem key={variant.id} variant={variant} onAdd={() => onAddBlock(variant.factory())} />
          ))}
        </div>
      ) : null}
    </div>
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
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: `${PALETTE_DRAG_PREFIX}${variant.id}`
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground has-[:focus-visible]:bg-accent has-[:focus-visible]:text-foreground',
        isDragging && 'opacity-50'
      )}
    >
      <div
        ref={setActivatorNodeRef}
        className="-my-1.5 flex min-w-0 flex-1 cursor-grab items-center gap-2 rounded py-1.5 active:cursor-grabbing focus-visible:outline-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{variant.label}</span>
      </div>
      <button
        type="button"
        aria-label={`Add ${variant.label} to preview`}
        onClick={onAdd}
        className="ml-auto flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border border-transparent text-muted-foreground opacity-0 transition-opacity hover:border-border hover:bg-background hover:text-foreground group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
