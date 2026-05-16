/**
 * Brand theme resolver for the BlockKitchen chrome.
 *
 * Consumers can already brand the builder by overriding the shadcn/ui
 * CSS custom properties declared in `styles.src.css` (the lower-level
 * contract). This module wraps that contract in a typed, ergonomic prop
 * — a preset name and/or a `Partial<BrandTokens>` map — and resolves it
 * to the `cssVarName -> value` pairs that `BrandThemeScope` then writes
 * to a scoped `<style>` block around the builder.
 *
 * Scope is intentionally limited to the builder chrome. The Slack
 * preview is rendered by `slack-blocks-to-jsx` under its own
 * `#slack_blocks_to_jsx` CSS namespace and does not consume these vars,
 * so brand tokens never leak into Slack content rendering.
 */

/**
 * Tokens consumers may override. Mirrors the shadcn/ui token set
 * already defined in `src/styles.src.css`. Color values are HSL
 * component strings ("231.7 48.6% 54.1%") — matching the existing
 * `hsl(var(--token, ...))` contract. `radius` takes a CSS length
 * such as `"0.5rem"`.
 */
export type BrandTokens = Partial<{
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}>;

/**
 * Curated preset names. Today only `'default'` exists (no overrides;
 * relies on the fallbacks in `styles.src.css`). Adding a preset later
 * is non-breaking — extend the string union and add an entry to
 * `PRESETS`.
 */
export type BrandPreset = 'default';

/**
 * Brand theme shape.
 *
 * - `preset` seeds the token map (currently a no-op for `'default'`).
 * - `tokens` applies in both light and dark.
 * - `light`/`dark` apply only when the matching dark-mode class is
 *   present on an ancestor (or on the scope itself).
 *
 * Merge precedence (later wins): preset → tokens → light/dark.
 */
export interface BrandTheme {
  preset?: BrandPreset;
  tokens?: BrandTokens;
  light?: BrandTokens;
  dark?: BrandTokens;
}

/** Maps camelCase token keys to the kebab-case CSS variable names
 *  declared by the consumer-facing shadcn/ui contract in `styles.src.css`. */
const TOKEN_TO_CSS_VAR: Record<keyof BrandTokens, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  radius: '--radius'
};

const PRESETS: Record<BrandPreset, BrandTokens> = {
  // No overrides — falls through to the fallbacks in styles.src.css so
  // we don't duplicate (and risk drifting from) the baseline values.
  default: {}
};

/**
 * Result of resolving a `BrandTheme`. Two parallel maps so the wrapper
 * can emit one rule for the light context and one for the `.dark` context.
 */
export interface ResolvedBrandTheme {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * Returns true when a candidate CSS value is safe to inject into a
 * `<style>` block. Rejects characters that could break out of the
 * declaration (`;`, braces) or comment markers, plus tag-like and
 * entity-like sequences that smell wrong inside a CSS value. The
 * accepted shape covers HSL component strings, CSS lengths, hex/rgb
 * colors, named colors, and `calc(...)` expressions.
 * @param value - candidate CSS value
 * @returns true if the value is safe to emit verbatim
 */
export function isSafeCssValue(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0 || value.length > 200) {
    return false;
  }
  // Disallow anything that could close the declaration, the rule, the
  // <style> element, or open a comment.
  return !/[;{}<>&]|\/\*|\*\/|\n|\r/.test(value);
}

/** Normalizes a user input that may be a preset string into a `BrandTheme`. */
function toBrandTheme(input: BrandTheme | BrandPreset | undefined): BrandTheme {
  if (input === undefined) {
    return {};
  }
  if (typeof input === 'string') {
    return { preset: input };
  }
  return input;
}

/**
 * Merges a partial token map into a `cssVarName -> value` accumulator.
 * Drops any value that fails `isSafeCssValue` rather than throwing so
 * one bad token doesn't lose the rest of the theme.
 */
function mergeTokens(target: Record<string, string>, source: BrandTokens | undefined): void {
  if (!source) {
    return;
  }
  for (const [key, value] of Object.entries(source) as [keyof BrandTokens, string | undefined][]) {
    if (value === undefined) {
      continue;
    }
    if (!isSafeCssValue(value)) {
      continue;
    }
    target[TOKEN_TO_CSS_VAR[key]] = value;
  }
}

/**
 * Resolves a `BrandTheme` (or a bare preset name) into two CSS-var maps:
 * one applied in light contexts and one applied under `.dark`. Returns
 * empty maps when the input contributes no overrides — the caller can
 * use that as a signal to skip the scope wrapper entirely.
 * @param input - the brand theme prop value, or `undefined`
 * @returns resolved CSS-var maps for light and dark contexts
 */
export function resolveBrandTheme(input: BrandTheme | BrandPreset | undefined): ResolvedBrandTheme {
  const theme = toBrandTheme(input);
  const presetTokens = theme.preset ? PRESETS[theme.preset] : undefined;

  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  mergeTokens(light, presetTokens);
  mergeTokens(dark, presetTokens);
  mergeTokens(light, theme.tokens);
  mergeTokens(dark, theme.tokens);
  mergeTokens(light, theme.light);
  mergeTokens(dark, theme.dark);

  return { light, dark };
}

/**
 * Serializes a CSS-var map to declaration text (e.g.
 * `"--primary: 0 100% 50%; --radius: 0.5rem;"`). Values are assumed
 * to already be sanitized by {@link isSafeCssValue}.
 * @param vars - CSS-var name → value map
 * @returns CSS declaration string, or `''` if `vars` is empty
 */
export function toCssDeclarations(vars: Record<string, string>): string {
  const entries = Object.entries(vars);
  if (entries.length === 0) {
    return '';
  }
  return entries.map(([name, value]) => `${name}: ${value};`).join(' ');
}
