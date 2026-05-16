import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { defaultTemplates } from '../lib/default-templates';
import { TemplatePicker } from './template-picker';

const SAMPLE_TEMPLATES = defaultTemplates;

const meta = {
  title: 'BlockKitchen/TemplatePicker',
  component: TemplatePicker,
  parameters: { layout: 'fullscreen' },
  args: {
    templates: SAMPLE_TEMPLATES,
    onSelect: fn(),
    heading: 'Templates'
  },
  decorators: [
    (Story) => (
      <div className="bk-root h-screen w-full bg-background">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof TemplatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilteredToMessageSurface: Story = {
  args: { surface: 'message' }
};

export const FilteredToModalSurface: Story = {
  args: { surface: 'modal' }
};

export const FilteredToAppHomeSurface: Story = {
  args: { surface: 'app_home' }
};

export const Empty: Story = {
  args: { surface: 'app_home', templates: SAMPLE_TEMPLATES.filter((t) => t.surface !== 'app_home') }
};

export const Uncategorized: Story = {
  args: {
    templates: SAMPLE_TEMPLATES.map(({ category: _category, ...rest }) => rest)
  }
};

export const DarkTheme: Story = {
  args: { theme: 'dark' },
  decorators: [
    (Story) => (
      <div className="bk-root dark h-screen w-full bg-background">
        <Story />
      </div>
    )
  ]
};

export const ClickCardInvokesHandler: Story = {
  args: { surface: 'message' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = await canvas.findByRole('button', { name: /expense approval/i });
    await userEvent.click(card);
    await expect(args.onSelect).toHaveBeenCalledOnce();
    await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'expense-approval' }));
  }
};
