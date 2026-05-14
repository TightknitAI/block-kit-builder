import {
  AlertTriangle,
  AppWindow,
  Check,
  ChevronDown,
  Code2,
  ExternalLink,
  Home,
  MessageSquare,
  Moon,
  Send,
  Sun,
  Trash2
} from 'lucide-react';
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

/**
 * Top toolbar with the preview theme picker, View JSON escape hatch, and
 * the Send action.
 * @param props - toolbar props
 * @param props.onClear - resets the draft to empty (disabled when already empty)
 * @param props.onOpenJson - opens the JSON drawer
 * @param props.onOpenIssues - opens the issues sheet
 * @param props.onOpenSend - opens the send dialog
 * @param props.canSend - whether the Send button should be enabled
 * @param props.canClear - whether the Clear button should be enabled
 * @param props.previewTheme - current preview theme
 * @param props.onPreviewThemeChange - called when the user picks a theme
 * @param props.previewSurface - which Slack surface to approximate
 * @param props.onPreviewSurfaceChange - called when the user picks a surface
 * @param props.showSurfaceControl - render the surface dropdown (default true)
 * @param props.showThemeControl - render the theme dropdown (default true)
 * @param props.errorCount - number of validation errors
 * @returns the rendered toolbar
 */
export function Toolbar({
  onClear,
  onOpenJson,
  onOpenIssues,
  onOpenSend,
  canSend,
  canClear,
  previewTheme,
  onPreviewThemeChange,
  previewSurface,
  onPreviewSurfaceChange,
  showSurfaceControl = true,
  showThemeControl = true,
  errorCount
}: {
  onClear: () => void;
  onOpenJson: () => void;
  onOpenIssues: () => void;
  onOpenSend: () => void;
  canSend: boolean;
  canClear: boolean;
  previewTheme: PreviewTheme;
  onPreviewThemeChange: (theme: PreviewTheme) => void;
  previewSurface: PreviewSurface;
  onPreviewSurfaceChange: (surface: PreviewSurface) => void;
  showSurfaceControl?: boolean;
  showThemeControl?: boolean;
  errorCount: number;
}) {
  const activeTheme = THEME_OPTIONS.find((t) => t.value === previewTheme) ?? THEME_OPTIONS[0];
  const activeSurface = SURFACE_OPTIONS.find((s) => s.value === previewSurface) ?? SURFACE_OPTIONS[0];

  return (
    <div className="flex items-center justify-between gap-2 border-b bg-background px-3 py-2">
      <div className="flex items-center gap-2">
        {showSurfaceControl ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <activeSurface.Icon className="h-3.5 w-3.5" />
                {activeSurface.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1">
              {SURFACE_OPTIONS.map(({ value, label, Icon }) => {
                const isActive = value === previewSurface;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onPreviewSurfaceChange(value)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-foreground',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="flex-1">{label}</span>
                    {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : null}
        {showThemeControl ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <activeTheme.Icon className="h-3.5 w-3.5" />
                {activeTheme.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-32 p-1">
              {THEME_OPTIONS.map(({ value, label, Icon }) => {
                const isActive = value === previewTheme;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onPreviewThemeChange(value)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-foreground',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="flex-1">{label}</span>
                    {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : null}
        <a
          href="https://docs.slack.dev/reference/block-kit/blocks"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Docs
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>
      <div className="flex items-center gap-2">
        {errorCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenIssues}
            className="text-destructive hover:text-destructive"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {errorCount} {errorCount === 1 ? 'issue' : 'issues'}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!canClear}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenJson}>
          <Code2 className="h-3.5 w-3.5" />
          View JSON
        </Button>
        <Button type="button" size="sm" onClick={onOpenSend} disabled={!canSend}>
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
      </div>
    </div>
  );
}
