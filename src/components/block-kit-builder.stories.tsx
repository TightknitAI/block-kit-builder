import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { SupportedBlock } from '../types';
import { BlockKitBuilder } from './block-kit-builder';

const STARTER_BLOCKS: SupportedBlock[] = [
  {
    type: 'header',
    text: { type: 'plain_text', text: 'Welcome to Block Kit', emoji: true }
  },
  {
    type: 'section',
    text: { type: 'mrkdwn', text: 'Compose Slack messages visually, then *send* or copy the JSON.' }
  },
  { type: 'divider' },
  {
    type: 'context',
    elements: [{ type: 'mrkdwn', text: 'Tip: drag a block from the palette on the left.' }]
  }
];

const meta = {
  title: 'BlockKitBuilder/BlockKitBuilder',
  component: BlockKitBuilder,
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'todo' }
  },
  args: {
    workspaceName: 'Acme Inc.',
    loadChannels: fn(async () => [
      { id: 'C100', name: 'general' },
      { id: 'C200', name: 'random' }
    ]),
    loadSendAsUserStatus: fn(async () => ({ canSendAsUser: true })),
    onSend: fn(async () => ({ ok: true })),
    onChange: fn()
  },
  decorators: [
    (Story) => (
      <div className="bkb-root" style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof BlockKitBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithStarterBlocks: Story = {
  args: {
    initialBlocks: STARTER_BLOCKS
  }
};

export const MessageSurfaceLocked: Story = {
  args: {
    initialBlocks: STARTER_BLOCKS,
    showThemeControl: false
  }
};

export const AllSurfaces: Story = {
  args: {
    initialBlocks: STARTER_BLOCKS,
    allowedSurfaces: ['message', 'modal', 'app_home']
  }
};

export const RestrictedBlockTypes: Story = {
  args: {
    initialBlocks: STARTER_BLOCKS,
    allowedBlockTypes: ['section', 'header', 'divider', 'markdown']
  }
};

export const DarkPreviewDefault: Story = {
  args: {
    initialBlocks: STARTER_BLOCKS,
    defaultPreviewTheme: 'dark'
  }
};

export const ClearButtonResetsBlocks: Story = {
  args: {
    initialBlocks: STARTER_BLOCKS
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('Welcome to Block Kit')).toBeInTheDocument();

    const clearBtn = await canvas.findByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    await expect(canvas.queryByText('Welcome to Block Kit')).not.toBeInTheDocument();
    await expect(args.onChange).toHaveBeenCalled();
  }
};

export const AddSectionFromPalette: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // "with button accessory" is unique to the Section palette group, so it
    // resolves to exactly one chevron button.
    const addSection = await canvas.findByRole('button', {
      name: /add with button accessory to preview/i
    });
    await userEvent.click(addSection);

    await expect(args.onChange).toHaveBeenCalled();
    const sendBtn = await canvas.findByRole('button', { name: /^send$/i });
    await expect(sendBtn).toBeEnabled();
  }
};
