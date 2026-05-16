import 'slack-blocks-to-jsx/dist/style.css';

import type { Block } from 'slack-blocks-to-jsx';
import { Message } from 'slack-blocks-to-jsx';
import { cn } from '../lib/cn';
import type { PreviewSurface, PreviewTheme, Template } from '../types';

const UNCATEGORIZED = 'Other';

/**
 * A live, scaled-down preview of a template's blocks rendered via
 * `slack-blocks-to-jsx`. The container is fixed-height with hidden
 * overflow so taller templates clip neatly into a thumbnail.
 */
function TemplateThumbnail({ blocks, theme }: { blocks: Template['blocks']; theme: PreviewTheme }) {
  return (
    // `inert` removes the rendered template's interactive controls (buttons,
    // links, inputs) from the focus order and pointer events so the wrapping
    // card stays the only interactive element — required to avoid the
    // `nested-interactive` a11y violation, and `aria-hidden` keeps the card's
    // accessible name to just the visible name + description below.
    <div
      inert
      aria-hidden="true"
      className="relative h-44 overflow-hidden rounded-md border bg-background shadow-inner"
    >
      <div
        id="slack_blocks_to_jsx"
        data-theme={theme}
        className="slack_blocks_to_jsx styles_enabled absolute top-0 left-0 w-[167%] origin-top-left scale-[0.6] p-3"
      >
        <Message time={new Date()} name="" logo="" withoutWrapper theme={theme} blocks={blocks as unknown as Block[]} />
      </div>
      {/* Soft fade at the bottom so clipped content doesn't end on a hard edge. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

const SURFACE_LABEL: Record<PreviewSurface, string> = {
  message: 'Message',
  modal: 'Modal',
  app_home: 'App Home'
};

/**
 * One template card: padded preview inside a raised card frame, with a
 * surface badge, name, and optional description below. The whole card
 * is a button; clicking it invokes `onSelect`.
 */
function TemplateCard({
  template,
  theme,
  onSelect
}: {
  template: Template;
  theme: PreviewTheme;
  onSelect: (template: Template) => void;
}) {
  // We render the card as a `div[role="button"]` rather than a `<button>`
  // because the live thumbnail's rendered blocks may include real
  // `<button>` elements (e.g. action blocks). Nesting buttons is invalid
  // HTML and React's DOM validator warns about it. `inert` on the
  // thumbnail removes the descendants from the focus order, so the card
  // div stays the only interactive element.
  const handleActivate = () => onSelect(template);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
      className="group flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 text-left shadow-sm ring-1 ring-black/5 transition-all duration-150 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <TemplateThumbnail blocks={template.blocks} theme={theme} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">{template.name}</span>
          {template.description ? (
            <span className="line-clamp-2 text-xs text-foreground/75">{template.description}</span>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-foreground/15 bg-background px-2 py-0.5 text-[10px] font-medium tracking-wide text-foreground/70 uppercase">
          {SURFACE_LABEL[template.surface]}
        </span>
      </div>
    </div>
  );
}

/**
 * Group templates by `category`. Templates without a category fall into
 * an `"Other"` bucket placed last; if no template specifies a category
 * the function returns a single ungrouped bucket and the picker omits
 * the section heading.
 */
function groupByCategory(templates: readonly Template[]): {
  grouped: boolean;
  sections: { category: string; templates: Template[] }[];
} {
  const anyCategorized = templates.some((t) => !!t.category);
  if (!anyCategorized) {
    return { grouped: false, sections: [{ category: UNCATEGORIZED, templates: [...templates] }] };
  }
  const map = new Map<string, Template[]>();
  for (const t of templates) {
    const key = t.category ?? UNCATEGORIZED;
    const arr = map.get(key) ?? [];
    arr.push(t);
    map.set(key, arr);
  }
  // Stable order: categories in first-seen order, with `Other` pinned last.
  const seen: string[] = [];
  for (const t of templates) {
    const key = t.category ?? UNCATEGORIZED;
    if (!seen.includes(key)) seen.push(key);
  }
  seen.sort((a, b) => (a === UNCATEGORIZED ? 1 : b === UNCATEGORIZED ? -1 : 0));
  return {
    grouped: true,
    sections: seen.map((category) => ({ category, templates: map.get(category) ?? [] }))
  };
}

/**
 * Standalone, page-sized picker that displays {@link Template}s as a
 * grid of cards with live block previews, organized into category
 * sections — modeled on Slack's own Block Kit Builder templates page.
 * Pure UI: wire `onSelect` to whatever state owns the draft blocks
 * (e.g. lifted `initialBlocks` on {@link BlockKitchen}, your own
 * store, a router-driven URL param).
 *
 * Compose alongside {@link BlockKitchen} however fits your layout
 * (route, modal, slide-over, tab). This component intentionally does
 * not own its own dialog so the consumer controls placement and
 * dismissal.
 *
 * @param props - picker props
 * @param props.templates - templates to show. Order is preserved within
 *   each category section.
 * @param props.onSelect - called when the user clicks a template card.
 * @param props.surface - optional surface filter. When set, only
 *   templates whose {@link Template.surface} matches are shown.
 * @param props.theme - preview theme used inside the card thumbnails.
 *   Defaults to `'light'`.
 * @param props.heading - optional heading rendered above the grid. When
 *   omitted, no heading is rendered.
 * @param props.emptyLabel - text shown when no templates match the
 *   surface filter. Defaults to `"No templates available."`.
 * @param props.className - additional classes merged onto the root.
 */
export function TemplatePicker({
  templates,
  onSelect,
  surface,
  theme = 'light',
  heading,
  emptyLabel = 'No templates available.',
  className
}: {
  templates: readonly Template[];
  onSelect: (template: Template) => void;
  surface?: PreviewSurface;
  theme?: PreviewTheme;
  heading?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const visible = surface ? templates.filter((t) => t.surface === surface) : templates;
  const { grouped, sections } = groupByCategory(visible);

  return (
    <div className={cn('flex h-full w-full flex-col gap-8 overflow-y-auto bg-muted/30 p-8', className)}>
      {heading ? <h2 className="text-xl font-semibold tracking-tight text-foreground">{heading}</h2> : null}
      {visible.length === 0 ? (
        <p className="text-sm text-foreground/75">{emptyLabel}</p>
      ) : (
        sections.map((section) => (
          <section key={section.category} className="flex flex-col gap-4">
            {grouped ? (
              <h3 className="text-xs font-semibold tracking-wider text-foreground/60 uppercase">{section.category}</h3>
            ) : null}
            {/* Container-driven grid: each column is at least 280px wide and
                grows to fill, so the picker adapts the same whether it's a
                narrow sidebar (1 col) or a full-page view (3-4 cols) without
                relying on viewport breakpoints. */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
              {section.templates.map((template) => (
                <TemplateCard key={template.id} template={template} theme={theme} onSelect={onSelect} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
