import { defaultPalette, extraAlertVariant, legacyInputVariants } from '../src/lib/default-blocks';
import { toSlackBlocks } from '../src/lib/to-slack-blocks';
import { decodeBlocksFromString, encodeBlocksToString } from '../src/lib/url-state';
import type { SupportedBlock } from '../src/types';

describe('toSlackBlocks', () => {
  it('strips the builder-only `level` field from header blocks', () => {
    const input: SupportedBlock[] = [
      {
        type: 'header',
        level: 2,
        text: { type: 'plain_text', text: 'Heading', emoji: true }
      } as SupportedBlock
    ];

    const [out] = toSlackBlocks(input);
    expect(out.type).toBe('header');
    expect('level' in out).toBe(false);
  });

  it('passes non-header blocks through unchanged', () => {
    const input: SupportedBlock[] = [
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'hello' }
      }
    ];
    expect(toSlackBlocks(input)).toEqual(input);
  });
});

describe('url-state', () => {
  it('roundtrips an arbitrary block list through encode/decode', () => {
    const blocks: SupportedBlock[] = [
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'hello *world*' }
      },
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Heading', emoji: true }
      }
    ];

    const encoded = encodeBlocksToString(blocks);
    expect(encoded).not.toBe('');
    expect(encoded).not.toMatch(/[+/=]/);

    const decoded = decodeBlocksFromString(encoded);
    expect(decoded).toEqual(blocks);
  });

  it('encodes an empty list as the empty string', () => {
    expect(encodeBlocksToString([])).toBe('');
  });

  it.each([
    null,
    undefined,
    '',
    'not-base64!!!',
    'eyJub3QiOiJhbiBhcnJheSJ9'
  ])('decodes invalid input %p to null', (input) => {
    expect(decodeBlocksFromString(input)).toBeNull();
  });

  it('preserves multibyte (utf-8) text through the roundtrip', () => {
    const blocks: SupportedBlock[] = [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'café 北京 🚀' }
      }
    ];
    expect(decodeBlocksFromString(encodeBlocksToString(blocks))).toEqual(blocks);
  });
});

describe('palette factories', () => {
  it('every variant factory returns a valid block payload', () => {
    for (const section of defaultPalette) {
      for (const variant of section.variants) {
        const block = variant.factory();
        // Sections like "Structure" and "Card and Carousel" intentionally
        // mix multiple block types, so we no longer assert that a
        // section maps to a single `type`. A truthy `type` is enough to
        // confirm the factory built a block-shaped payload.
        expect(typeof block.type).toBe('string');
        expect(block.type.length).toBeGreaterThan(0);
      }
    }
  });

  it('variant ids are unique across the palette', () => {
    const ids = defaultPalette.flatMap((s) => s.variants.map((v) => v.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('legacy input variants keep building input blocks', () => {
    for (const variant of legacyInputVariants) {
      expect(variant.factory().type).toBe('input');
    }
    expect(extraAlertVariant.factory().type).toBe('alert');
  });
});
