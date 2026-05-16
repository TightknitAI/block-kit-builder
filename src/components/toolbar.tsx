import {
  AlertTriangle,
  AppWindow,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  ExternalLink,
  Home,
  MessageSquare,
  Moon,
  Plus,
  Send,
  Sun,
  Trash2
} from 'lucide-react';
import type { ComponentType, KeyboardEvent } from 'react';
import { useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { Button } from '../lib/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../lib/ui/popover';
import type { PreviewSurface, PreviewTheme } from '../types';

const THEME_OPTIONS: {
  value: PreviewTheme;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon }
];

const SURFACE_OPTIONS: {
  value: PreviewSurface;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: 'message', label: 'Message', Icon: MessageSquare },
  { value: 'modal', label: 'Modal', Icon: AppWindow },
  { value: 'app_home', label: 'App Home', Icon: Home }
];

const DEFAULT_DOCS_HREF = 'https://docs.slack.dev/reference/block-kit/blocks';
const DEFAULT_DOCS_LABEL = 'Docs';

/**
 * Top toolbar with the preview theme picker, View JSON escape hatch, and
 * the Send action.
 * @param props - toolbar props
 * @param props.onClear - resets the draft to empty (disabled when already empty)
 * @param props.onOpenJson - opens the JSON drawer
 * @param props.onOpenIssues - opens the issues sheet
 * @param props.onOpenSend - opens the send dialog
 * @param props.onOpenPalette - opens the mobile palette sheet
 * @param props.canSend - whether the Send button should be enabled
 * @param props.canClear - whether the Clear button should be enabled
 * @param props.previewTheme - current preview theme
 * @param props.onPreviewThemeChange - called when the user picks a theme
 * @param props.previewSurface - which Slack surface to approximate
 * @param props.onPreviewSurfaceChange - called when the user picks a surface
 * @param props.allowedSurfaces - surfaces shown in the dropdown. When the
 *   list has 0 or 1 entry the dropdown is hidden entirely.
 * @param props.showThemeControl - render the theme dropdown (default true)
 * @param props.docsLink - customize or hide the Docs link. `false` hides it;
 *   an object overrides `href` and/or `label`. Defaults to the Slack Block
 *   Kit reference docs.
 * @param props.errorCount - number of validation errors
 * @returns the rendered toolbar
 */
export function Toolbar({
  onClear,
  onOpenJson,
  onOpenIssues,
  onOpenSend,
  onOpenPalette,
  canSend,
  canClear,
  previewTheme,
  onPreviewThemeChange,
  previewSurface,
  onPreviewSurfaceChange,
  allowedSurfaces,
  showThemeControl = true,
  docsLink,
  errorCount
}: {
  onClear: () => void;
  onOpenJson: () => void;
  onOpenIssues: () => void;
  onOpenSend: () => void;
  onOpenPalette?: () => void;
  canSend: boolean;
  canClear: boolean;
  previewTheme: PreviewTheme;
  onPreviewThemeChange: (theme: PreviewTheme) => void;
  previewSurface: PreviewSurface;
  onPreviewSurfaceChange: (surface: PreviewSurface) => void;
  allowedSurfaces: readonly PreviewSurface[];
  showThemeControl?: boolean;
  docsLink?: false | { href?: string; label?: string };
  errorCount: number;
}) {
  const activeTheme = THEME_OPTIONS.find((t) => t.value === previewTheme) ?? THEME_OPTIONS[0];
  const activeSurface = SURFACE_OPTIONS.find((s) => s.value === previewSurface) ?? SURFACE_OPTIONS[0];
  const surfaceOptions = SURFACE_OPTIONS.filter((s) => allowedSurfaces.includes(s.value));
  const showSurfaceControl = surfaceOptions.length > 1;
  const docsHref = docsLink === false ? null : (docsLink?.href ?? DEFAULT_DOCS_HREF);
  const docsLabel = docsLink === false ? null : (docsLink?.label ?? DEFAULT_DOCS_LABEL);

  // Controlled open state so we can close the menus after a selection — the
  // `role="menuitemradio"` semantics imply activation dismisses the menu.
  const [surfaceMenuOpen, setSurfaceMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b bg-background px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
        {onOpenPalette ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenPalette}
            className="md:hidden"
            aria-label="Add a block"
          >
            <Plus className="h-4 w-4" />
            <span>Blocks</span>
          </Button>
        ) : null}
        {showSurfaceControl ? (
          <Popover open={surfaceMenuOpen} onOpenChange={setSurfaceMenuOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" aria-label={`Preview surface: ${activeSurface.label}`}>
                <activeSurface.Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{activeSurface.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1">
              <Menu<PreviewSurface>
                ariaLabel="Preview surface"
                options={surfaceOptions}
                value={previewSurface}
                onChange={(next) => {
                  onPreviewSurfaceChange(next);
                  setSurfaceMenuOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}
        {showThemeControl ? (
          <Popover open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" aria-label={`Preview theme: ${activeTheme.label}`}>
                <activeTheme.Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{activeTheme.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-32 p-1">
              <Menu<PreviewTheme>
                ariaLabel="Preview theme"
                options={THEME_OPTIONS}
                value={previewTheme}
                onChange={(next) => {
                  onPreviewThemeChange(next);
                  setThemeMenuOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}
        {docsHref ? (
          <a
            href={docsHref}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden h-8 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:inline-flex"
            aria-label={`${docsLabel} (opens in a new tab)`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {docsLabel}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        ) : null}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {errorCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenIssues}
            className="text-destructive hover:text-destructive"
            aria-label={`${errorCount} ${errorCount === 1 ? 'issue' : 'issues'}`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {errorCount} <span className="hidden sm:inline">{errorCount === 1 ? 'issue' : 'issues'}</span>
            </span>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!canClear}
          className="hover:bg-destructive/10 hover:text-destructive"
          aria-label="Clear all blocks"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenJson} aria-label="View JSON">
          <Code2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">View JSON</span>
          <span className="sm:hidden">JSON</span>
        </Button>
        <Button type="button" size="sm" onClick={onOpenSend} disabled={!canSend}>
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
      </div>
    </div>
  );
}

/**
 * Single-select dropdown menu rendered inside a Popover. Adds proper
 * `role="menu"` / `role="menuitem"` semantics and arrow-key navigation
 * between options. Avoiding `@radix-ui/react-dropdown-menu` keeps this
 * dependency-free; the wrapping `Popover` already handles outside-click
 * dismiss, focus return, and Escape.
 */
function Menu<T extends string>({
  ariaLabel,
  options,
  value,
  onChange
}: {
  ariaLabel: string;
  options: readonly { value: T; label: string; Icon: ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (next: T) => void;
}) {
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const moveFocus = (from: number, delta: number) => {
    const len = options.length;
    if (len === 0) return;
    const next = (from + delta + len) % len;
    itemsRef.current[next]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(idx, 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(idx, -1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      itemsRef.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      itemsRef.current[options.length - 1]?.focus();
    }
  };

  return (
    <div role="menu" aria-label={ariaLabel} className="flex flex-col">
      {options.map(({ value: optValue, label, Icon }, idx) => {
        const isActive = optValue === value;
        return (
          <button
            key={optValue}
            ref={(el) => {
              itemsRef.current[idx] = el;
            }}
            type="button"
            role="menuitemradio"
            aria-checked={isActive}
            onClick={() => onChange(optValue)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="flex-1">{label}</span>
            {isActive ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
        );
      })}
    </div>
  );
}
