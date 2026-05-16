import { sanitizeBlock, sanitizeBlocks } from '../src/lib/sanitize-blocks';
import type { SupportedBlock } from '../src/types';

describe('sanitizeBlock', () => {
  it('strips javascript: from a section button url', () => {
    const block = {
      type: 'section',
      text: { type: 'mrkdwn', text: 'hi' },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: 'Click' },
        url: 'javascript:alert(1)',
        action_id: 'x'
      }
    } as unknown as SupportedBlock;
    const out = sanitizeBlock(block) as typeof block;
    expect((out.accessory as { url: string }).url).toBe('');
  });

  it('strips javascript: from a rich_text link url', () => {
    const block: SupportedBlock = {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_section',
          elements: [{ type: 'link', url: 'javascript:alert(1)', text: 'click me' }]
        }
      ]
    } as SupportedBlock;
    const out = sanitizeBlock(block) as typeof block;
    const link = (out.elements[0] as { elements: { url: string }[] }).elements[0];
    expect(link.url).toBe('');
  });

  it('strips data:image/svg+xml from image_url', () => {
    const block = {
      type: 'image',
      image_url: 'data:image/svg+xml,<svg onload=alert(1)>',
      alt_text: 'evil'
    } as unknown as SupportedBlock;
    const out = sanitizeBlock(block) as typeof block & { image_url: string };
    expect(out.image_url).toBe('');
  });

  it('leaves safe URLs intact', () => {
    const block = {
      type: 'section',
      text: { type: 'mrkdwn', text: 'hi' },
      accessory: {
        type: 'image',
        image_url: 'https://example.com/img.png',
        alt_text: 'pic'
      }
    } as unknown as SupportedBlock;
    const out = sanitizeBlock(block);
    expect(out).toBe(block); // reference-stable when nothing changed
  });

  it('returns a new reference only when a URL was rewritten', () => {
    const safe = { type: 'divider' } as SupportedBlock;
    expect(sanitizeBlock(safe)).toBe(safe);

    const unsafe = {
      type: 'image',
      image_url: 'javascript:alert(1)',
      alt_text: 'evil'
    } as unknown as SupportedBlock;
    expect(sanitizeBlock(unsafe)).not.toBe(unsafe);
  });

  it('walks into nested arrays (carousel of cards with bad action urls)', () => {
    const block = {
      type: 'carousel',
      elements: [
        {
          type: 'card',
          actions: [
            { type: 'button', text: { type: 'plain_text', text: 'A' }, url: 'javascript:alert(1)' },
            { type: 'button', text: { type: 'plain_text', text: 'B' }, url: 'https://ok.example.com' }
          ]
        }
      ]
    } as unknown as SupportedBlock;
    const out = sanitizeBlock(block) as typeof block;
    const actions = (out.elements[0] as { actions: { url: string }[] }).actions;
    expect(actions[0].url).toBe('');
    expect(actions[1].url).toBe('https://ok.example.com');
  });
});

describe('sanitizeBlocks', () => {
  it('returns the same array reference when nothing needs rewriting', () => {
    const blocks: SupportedBlock[] = [{ type: 'divider' }];
    expect(sanitizeBlocks(blocks)).toBe(blocks);
  });

  it('returns a new array when any block was rewritten', () => {
    const blocks = [
      {
        type: 'image',
        image_url: 'javascript:alert(1)',
        alt_text: 'evil'
      }
    ] as unknown as SupportedBlock[];
    expect(sanitizeBlocks(blocks)).not.toBe(blocks);
  });
});

describe('prototype pollution shape', () => {
  it('a JSON object with __proto__ key does not pollute Object.prototype', () => {
    const parsed = JSON.parse('{"__proto__": {"polluted": true}}');
    // Modern engines treat `__proto__` in JSON as a plain own property
    // (it does NOT mutate the prototype). Our sanitizer should preserve
    // that behavior — no merge that walks the prototype chain.
    const sanitized = sanitizeBlock(parsed as SupportedBlock);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.hasOwn(sanitized, '__proto__')).toBe(true);
  });
});
