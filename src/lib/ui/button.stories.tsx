import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Click me', onClick: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const LinkStyle: Story = { args: { variant: 'link' } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button');
    await expect(btn).toBeDisabled();
    // Disabled buttons render with `pointer-events: none`, so userEvent's
    // click check would throw before reaching the handler. Bypass that
    // check and confirm the handler stays uninvoked — the browser-level
    // disabled state is what really gates the call.
    await userEvent.click(btn, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  }
};

export const ClickFiresHandler: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledOnce();
  }
};
