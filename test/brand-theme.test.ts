import { isSafeCssValue, resolveBrandTheme, toCssDeclarations } from '../src/lib/brand-theme';

describe('resolveBrandTheme', () => {
  it('returns empty maps when input is omitted', () => {
    expect(resolveBrandTheme(undefined)).toEqual({ light: {}, dark: {} });
  });

  it("treats the 'default' preset as a no-op so it does not duplicate the CSS fallbacks", () => {
    expect(resolveBrandTheme('default')).toEqual({ light: {}, dark: {} });
    expect(resolveBrandTheme({ preset: 'default' })).toEqual({ light: {}, dark: {} });
  });

  it('writes `tokens` to both the light and dark maps', () => {
    const result = resolveBrandTheme({ tokens: { primary: '0 100% 50%', radius: '0.5rem' } });
    expect(result.light).toEqual({ '--primary': '0 100% 50%', '--radius': '0.5rem' });
    expect(result.dark).toEqual({ '--primary': '0 100% 50%', '--radius': '0.5rem' });
  });

  it('lets `light` and `dark` override `tokens` per mode', () => {
    const result = resolveBrandTheme({
      tokens: { primary: '0 100% 50%', radius: '0.5rem' },
      light: { primary: '200 50% 50%' },
      dark: { primary: '210 60% 40%' }
    });
    expect(result.light['--primary']).toBe('200 50% 50%');
    expect(result.dark['--primary']).toBe('210 60% 40%');
    // radius came from `tokens` and isn't overridden in either mode
    expect(result.light['--radius']).toBe('0.5rem');
    expect(result.dark['--radius']).toBe('0.5rem');
  });

  it('translates camelCase keys to the expected kebab-case CSS variable names', () => {
    const result = resolveBrandTheme({
      tokens: {
        cardForeground: '210 5% 10%',
        popoverForeground: '210 5% 20%',
        primaryForeground: '0 0% 100%',
        mutedForeground: '210 5% 50%',
        destructiveForeground: '0 0% 100%'
      }
    });
    expect(result.light).toEqual({
      '--card-foreground': '210 5% 10%',
      '--popover-foreground': '210 5% 20%',
      '--primary-foreground': '0 0% 100%',
      '--muted-foreground': '210 5% 50%',
      '--destructive-foreground': '0 0% 100%'
    });
  });

  it('drops unsafe values but keeps the rest of the theme', () => {
    const result = resolveBrandTheme({
      tokens: {
        primary: '0 100% 50%',
        secondary: 'red; } body { display: none',
        radius: '0.5rem'
      }
    });
    expect(result.light).toEqual({ '--primary': '0 100% 50%', '--radius': '0.5rem' });
    expect(result.light['--secondary']).toBeUndefined();
  });

  it('ignores undefined token values without dropping the surrounding keys', () => {
    const result = resolveBrandTheme({ tokens: { primary: '0 100% 50%', radius: undefined } });
    expect(result.light).toEqual({ '--primary': '0 100% 50%' });
  });
});

describe('isSafeCssValue', () => {
  it.each([
    '0 100% 50%',
    '0.5rem',
    '#ff00aa',
    'rgb(20 30 40 / 0.5)',
    'hsl(231.7 48.6% 54.1%)',
    'calc(0.5rem - 2px)',
    'oklch(0.7 0.2 30)'
  ])('accepts %p', (value) => {
    expect(isSafeCssValue(value)).toBe(true);
  });

  it.each([
    'red; color: blue',
    'red } body { background: black',
    'red /* comment */ blue',
    'red */ */',
    '<script>',
    'red\nblue',
    'red & blue',
    ''
  ])('rejects %p', (value) => {
    expect(isSafeCssValue(value)).toBe(false);
  });

  it('rejects oversized inputs to avoid runaway styles', () => {
    expect(isSafeCssValue('a'.repeat(500))).toBe(false);
  });
});

describe('toCssDeclarations', () => {
  it('serializes a map to space-joined declarations', () => {
    expect(toCssDeclarations({ '--primary': '0 100% 50%', '--radius': '0.5rem' })).toBe(
      '--primary: 0 100% 50%; --radius: 0.5rem;'
    );
  });

  it('returns the empty string for an empty map', () => {
    expect(toCssDeclarations({})).toBe('');
  });
});
