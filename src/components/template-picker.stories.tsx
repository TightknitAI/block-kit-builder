import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { Template } from '../types';
import { TemplatePicker } from './template-picker';

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'approval-request',
    name: 'Approval request',
    description: 'Header + body + approve/reject actions.',
    category: 'Approvals',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Approval needed' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Sarah* requested time off from *Mar 12* to *Mar 18*.' }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Approve' },
            style: 'primary',
            value: 'approve'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Reject' },
            style: 'danger',
            value: 'reject'
          }
        ]
      }
    ]
  },
  {
    id: 'expense-approval',
    name: 'Expense approval',
    description: 'Approve an expense report inline.',
    category: 'Approvals',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Expense report' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Amount:* $1,240.00\n*Category:* Travel' }
      },
      { type: 'divider' }
    ]
  },
  {
    id: 'new-comment',
    name: 'New comment',
    description: 'Notify a channel about a new comment.',
    category: 'Notifications',
    surface: 'message',
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: ':speech_balloon: *Alex* left a comment on *Project Kickoff*.' }
      },
      { type: 'context', elements: [{ type: 'mrkdwn', text: '2 minutes ago' }] }
    ]
  },
  {
    id: 'product-release',
    name: 'Product release',
    description: 'Announce a new release with a CTA.',
    category: 'Notifications',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'We just shipped v2.5' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'New: bulk edit, keyboard shortcuts, and a redesigned inbox.' }
      }
    ]
  },
  {
    id: 'daily-standup',
    name: 'Daily standup',
    description: 'Yesterday / Today / Blockers prompts.',
    category: 'Polls and surveys',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Daily standup' } },
      { type: 'section', text: { type: 'mrkdwn', text: '*Yesterday:* ...' } },
      { type: 'section', text: { type: 'mrkdwn', text: '*Today:* ...' } },
      { type: 'section', text: { type: 'mrkdwn', text: '*Blockers:* ...' } }
    ]
  },
  {
    id: 'confirm-delete',
    name: 'Confirm delete',
    description: 'Modal confirmation before a destructive action.',
    category: 'Approvals',
    surface: 'modal',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Are you sure?' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'This will permanently delete the workspace.' }
      }
    ]
  },
  {
    id: 'home-welcome',
    name: 'Welcome',
    description: 'App home tab welcome layout.',
    surface: 'app_home',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Welcome' } },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'Your app home tab content goes here.' }
      }
    ]
  }
];

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
    const approval = await canvas.findByRole('button', { name: /approval request/i });
    await userEvent.click(approval);
    await expect(args.onSelect).toHaveBeenCalledOnce();
    await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'approval-request' }));
  }
};
