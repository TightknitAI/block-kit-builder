import { DndContext } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { defaultPalette, type PaletteSection } from '../lib/default-blocks';
import { Palette } from './palette';

const meta = {
  title: 'BlockKitchen/Palette',
  component: Palette,
  args: {
    onAddBlock: fn(),
    sections: defaultPalette
  },
  decorators: [
    (Story) => (
      <DndContext>
        <div className="bk-root flex h-[600px] border bg-background text-foreground">
          <Story />
        </div>
      </DndContext>
    )
  ]
} satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AddBlockViaChevron: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // The divider section has a single variant labeled "plain", so the
    // chevron's aria-label is "Add plain to preview".
    const dividerAdd = await canvas.findByRole('button', { name: /^add plain to preview$/i });
    await userEvent.click(dividerAdd);
    await expect(args.onAddBlock).toHaveBeenCalledOnce();
    const [block] = (args.onAddBlock as ReturnType<typeof fn>).mock.calls[0];
    expect(block.type).toBe('divider');
  }
};

const CUSTOM_PALETTE: readonly PaletteSection[] = [
  ...defaultPalette.filter((s) => s.blockType === 'section' || s.blockType === 'divider'),
  {
    name: 'Company presets',
    blockType: 'section',
    variants: [
      {
        id: 'help_footer',
        label: 'help footer',
        factory: () => ({
          type: 'section',
          text: { type: 'mrkdwn', text: 'Need help? Reach out in <#C0HELP>.' }
        })
      }
    ]
  }
];

export const CustomPalette: Story = {
  args: {
    sections: CUSTOM_PALETTE
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const helpAdd = await canvas.findByRole('button', { name: /^add help footer to preview$/i });
    await userEvent.click(helpAdd);
    await expect(args.onAddBlock).toHaveBeenCalledOnce();
    const [block] = (args.onAddBlock as ReturnType<typeof fn>).mock.calls[0];
    expect(block.type).toBe('section');
  }
};
