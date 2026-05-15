import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TooltipProvider } from '../lib/ui/tooltip';
import { Toolbar } from './toolbar';

const meta = {
  title: 'BlockKitBuilder/Toolbar',
  component: Toolbar,
  parameters: { layout: 'fullscreen' },
  args: {
    onClear: fn(),
    onOpenJson: fn(),
    onOpenIssues: fn(),
    onOpenSend: fn(),
    canSend: true,
    canClear: true,
    previewTheme: 'light',
    onPreviewThemeChange: fn(),
    previewSurface: 'message',
    onPreviewSurfaceChange: fn(),
    errorCount: 0
  },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={0}>
        <div className="bkb-root border-b">
          <Story />
        </div>
      </TooltipProvider>
    )
  ]
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { canSend: false, canClear: false }
};

export const WithIssues: Story = {
  args: { errorCount: 3 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const issuesBtn = await canvas.findByRole('button', { name: /3 issues/i });
    await userEvent.click(issuesBtn);
    await expect(args.onOpenIssues).toHaveBeenCalledOnce();
  }
};

export const SurfaceControlHidden: Story = {
  args: { showSurfaceControl: false }
};

export const ThemeControlHidden: Story = {
  args: { showThemeControl: false }
};

export const ClickSendInvokesHandler: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sendBtn = await canvas.findByRole('button', { name: /send/i });
    await userEvent.click(sendBtn);
    await expect(args.onOpenSend).toHaveBeenCalledOnce();
  }
};
