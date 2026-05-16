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

export const WithSearchQuery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = await canvas.findByRole('searchbox', { name: /search blocks/i });
    await userEvent.type(search, 'button');
    // "button", "link button", "multiple buttons" all live under Actions.
    await canvas.findByText('button');
    await canvas.findByText('link button');
    await canvas.findByText('multiple buttons');
  }
};

export const AllCollapsed: Story = {
  args: {
    defaultOpenSections: false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dividerHeader = await canvas.findByRole('button', { name: /^divider$/i });
    expect(dividerHeader).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByRole('button', { name: /^add plain to preview$/i })).toBeNull();
  }
};

export const OnlySectionOpen: Story = {
  args: {
    defaultOpenSections: ['Section']
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sectionHeader = await canvas.findByRole('button', { name: /^section$/i });
    expect(sectionHeader).toHaveAttribute('aria-expanded', 'true');
    const dividerHeader = await canvas.findByRole('button', { name: /^divider$/i });
    expect(dividerHeader).toHaveAttribute('aria-expanded', 'false');
  }
};

export const CollapseToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dividerHeader = await canvas.findByRole('button', { name: /^divider$/i });
    expect(dividerHeader).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(dividerHeader);
    expect(dividerHeader).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByRole('button', { name: /^add plain to preview$/i })).toBeNull();
    await userEvent.click(dividerHeader);
    expect(dividerHeader).toHaveAttribute('aria-expanded', 'true');
  }
};

export const NoMatchEmptyState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = await canvas.findByRole('searchbox', { name: /search blocks/i });
    await userEvent.type(search, 'zzzzzz');
    await canvas.findByText(/no blocks match/i);
  }
};

export const SearchHidden: Story = {
  args: {
    showSearch: false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('searchbox')).toBeNull();
    // Sections still render normally. Use "Divider" — its variant label
    // ("plain") doesn't collide with the header text.
    await canvas.findByRole('button', { name: /^divider$/i });
  }
};

export const CustomSearchPlaceholder: Story = {
  args: {
    searchPlaceholder: 'Find a block…'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('searchbox', { name: /find a block/i });
  }
};
