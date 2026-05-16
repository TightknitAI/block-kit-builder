import { type ReactNode, useId, useMemo } from 'react';
import { type BrandPreset, type BrandTheme, resolveBrandTheme, toCssDeclarations } from '../lib/brand-theme';

/**
 * Wraps the builder tree in a scoped `<style>` block that writes the
 * resolved brand CSS variables onto `:root`, gated by `:has()` on a
 * per-instance `data-bkb-scope` attribute. Writing the vars at `:root`
 * is necessary because Radix's `Portal` (used by every popover, dialog,
 * tooltip, and sheet in this package) renders into `document.body`
 * outside the React subtree — variables on an inner wrapper would
 * never reach them. With `:root` as the carrier and `:has()` as the
 * gate, the cascade covers both the in-tree chrome and all portaled
 * descendants without us having to plumb a `container` prop through
 * every Radix wrapper.
 *
 * When the resolved theme contains no overrides (`theme` omitted, or
 * a `'default'` preset with no token map), the wrapper bypasses itself
 * entirely so consumers who haven't opted in see zero behavioral change.
 *
 * Dark-mode coverage matches shadcn's class-based dark mode. The dark
 * rule targets the `.dark` element itself (any ancestor of the scope
 * carrying the class — be it `<html>`, `<body>`, or an inner wrapper)
 * rather than `:root`. This is load-bearing: the bundled
 * `slack-blocks-to-jsx` stylesheet ships its own `.dark { --primary: ...; }`
 * baseline that we need to outrank. Setting the vars at `:root.dark`
 * would lose the cascade fight against that closer `.dark` ancestor;
 * setting them at `.dark:has(...)` puts our values on the same element
 * the library targets, with a higher-specificity selector that wins.
 *
 * Browser support: `:has()` is widely available (Chrome 105+, Safari
 * 15.4+, Firefox 121+) and is already implied by the Tailwind v4
 * baseline this package builds against.
 * @param props - wrapper props
 * @param props.theme - the brand theme prop, forwarded from {@link BlockKitBuilder}
 * @param props.children - the builder tree
 * @returns the children, optionally wrapped in a scoped theme block
 */
export function BrandThemeScope({ theme, children }: { theme?: BrandTheme | BrandPreset; children: ReactNode }) {
  // `useId` produces something like `:r0:` — strip the colons so the
  // string can safely sit inside an attribute selector.
  const rawId = useId();
  const scopeId = useMemo(() => `bkb-${rawId.replace(/[:]/g, '')}`, [rawId]);

  const resolved = useMemo(() => resolveBrandTheme(theme), [theme]);

  const hasLight = Object.keys(resolved.light).length > 0;
  const hasDark = Object.keys(resolved.dark).length > 0;

  if (!hasLight && !hasDark) {
    return <>{children}</>;
  }

  const lightDecl = toCssDeclarations(resolved.light);
  const darkDecl = toCssDeclarations(resolved.dark);

  const rules: string[] = [];
  if (lightDecl) {
    rules.push(`:root:has([data-bkb-scope="${scopeId}"]) { ${lightDecl} }`);
  }
  if (darkDecl) {
    // Match the .dark element itself wherever it sits in the ancestor
    // chain. Two variants cover all placements: an ancestor that
    // contains the scope, or the scope element itself carrying .dark.
    const darkSelectors = [`.dark:has([data-bkb-scope="${scopeId}"])`, `.dark[data-bkb-scope="${scopeId}"]`].join(', ');
    rules.push(`${darkSelectors} { ${darkDecl} }`);
  }

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: rule
          values are filtered by isSafeCssValue; the scope id is
          derived from useId(). */}
      <style dangerouslySetInnerHTML={{ __html: rules.join(' ') }} />
      <div data-bkb-scope={scopeId} style={{ display: 'contents' }}>
        {children}
      </div>
    </>
  );
}
