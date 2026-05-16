import { render } from '@testing-library/react';
import { BrandThemeScope } from '../src/components/brand-theme-scope';

describe('BrandThemeScope', () => {
  it('bypasses the wrapper entirely when theme is omitted', () => {
    const { container } = render(
      <BrandThemeScope>
        <span data-testid="child">child</span>
      </BrandThemeScope>
    );
    // No <style> tag, no scope div — children render directly.
    expect(container.querySelector('style')).toBeNull();
    expect(container.querySelector('[data-bkb-scope]')).toBeNull();
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it("bypasses the wrapper when the 'default' preset contributes no overrides", () => {
    const { container } = render(
      <BrandThemeScope theme="default">
        <span data-testid="child">child</span>
      </BrandThemeScope>
    );
    expect(container.querySelector('style')).toBeNull();
    expect(container.querySelector('[data-bkb-scope]')).toBeNull();
  });

  it('emits a scoped <style> block targeting :root via :has() so portaled content inherits', () => {
    const { container } = render(
      <BrandThemeScope theme={{ tokens: { primary: '0 100% 50%', radius: '0.5rem' } }}>
        <span>child</span>
      </BrandThemeScope>
    );

    const styleEl = container.querySelector('style');
    expect(styleEl).not.toBeNull();
    const css = styleEl?.textContent ?? '';

    expect(css).toMatch(/:root:has\(\[data-bkb-scope="bkb-[^"]+"\]\)/);
    expect(css).toContain('--primary: 0 100% 50%');
    expect(css).toContain('--radius: 0.5rem');

    // The wrapper div carries the matching scope id and is layout-neutral.
    const wrapper = container.querySelector('[data-bkb-scope]') as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.display).toBe('contents');

    const scopeId = wrapper?.getAttribute('data-bkb-scope') ?? '';
    expect(css).toContain(`[data-bkb-scope="${scopeId}"]`);
  });

  it('emits a dark rule targeting the .dark element itself so it outranks upstream .dark baselines', () => {
    const { container } = render(
      <BrandThemeScope
        theme={{
          tokens: { primary: '0 100% 50%' },
          dark: { primary: '210 80% 60%' }
        }}
      >
        <span>child</span>
      </BrandThemeScope>
    );
    const css = container.querySelector('style')?.textContent ?? '';
    // .dark ancestor of the scope (covers <html class="dark">, <body class="dark">,
    // and any wrapping <div class="dark">), or .dark on the scope element itself.
    expect(css).toMatch(/\.dark:has\(\[data-bkb-scope="bkb-[^"]+"\]\)/);
    expect(css).toMatch(/\.dark\[data-bkb-scope="bkb-[^"]+"\]/);
    expect(css).toContain('--primary: 210 80% 60%');
  });

  it('produces unique scope ids for sibling instances so themes do not collide', () => {
    const { container } = render(
      <>
        <BrandThemeScope theme={{ tokens: { primary: '0 100% 50%' } }}>
          <span>a</span>
        </BrandThemeScope>
        <BrandThemeScope theme={{ tokens: { primary: '200 100% 50%' } }}>
          <span>b</span>
        </BrandThemeScope>
      </>
    );
    const wrappers = container.querySelectorAll('[data-bkb-scope]');
    expect(wrappers.length).toBe(2);
    const ids = Array.from(wrappers).map((el) => el.getAttribute('data-bkb-scope'));
    expect(new Set(ids).size).toBe(2);
  });
});
