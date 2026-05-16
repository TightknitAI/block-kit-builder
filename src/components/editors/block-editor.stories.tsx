import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import { buildVariantById, defaultPalette } from '../../lib/default-blocks';
import { TooltipProvider } from '../../lib/ui/tooltip';
import type { SupportedBlock } from '../../types';
import { BlockEditor } from './block-editor';

const VARIANT_BY_ID = buildVariantById(defaultPalette);

/**
 * Resolves a palette variant id to a fresh block payload, so stories
 * track the same defaults the palette inserts at runtime.
 */
function variant(id: string): SupportedBlock {
  const v = VARIANT_BY_ID.get(id);
  if (!v) {
    throw new Error(`Unknown palette variant: ${id}`);
  }
  return v.factory();
}

const meta = {
  title: 'BlockKitBuilder/BlockEditor',
  component: BlockEditor,
  parameters: {
    layout: 'centered',
    // The editor renders many native form controls (e.g. radio groups,
    // number inputs) inside a popover-style surface; axe occasionally
    // flags low-contrast affordances depending on the active theme. Run
    // a11y checks against the live builder story for the integrated view.
    a11y: { test: 'todo' }
  },
  args: { onChange: fn() },
  // Render via a hook so the editor is interactive: edits in the form
  // flow back into `args.block` and re-render the story, while also
  // invoking the spy on `args.onChange` so play functions can assert.
  render: function BlockEditorStoryRender(args) {
    const [{ block }, updateArgs] = useArgs<{ block: SupportedBlock }>();
    return (
      <BlockEditor
        block={block}
        errors={args.errors}
        onChange={(next) => {
          args.onChange?.(next);
          updateArgs({ block: next });
        }}
      />
    );
  },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={200}>
        <div className="bkb-root w-[32rem] max-h-[80vh] overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
          <Story />
        </div>
      </TooltipProvider>
    )
  ]
} satisfies Meta<typeof BlockEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ----------------------------- Per-block-type ----------------------------- */

export const Section: Story = {
  args: { block: variant('section_mrkdwn') }
};

export const SectionWithButtonAccessory: Story = {
  args: { block: variant('section_with_button') }
};

export const SectionWithImageAccessory: Story = {
  args: { block: variant('section_with_image') }
};

export const Header: Story = {
  args: { block: variant('header_default') }
};

export const Divider: Story = {
  args: { block: variant('divider_plain') }
};

export const Context: Story = {
  args: { block: variant('context_text_and_images') }
};

export const Actions: Story = {
  args: { block: variant('actions_multiple_buttons') }
};

export const Image: Story = {
  args: { block: variant('image_with_title') }
};

export const Markdown: Story = {
  args: { block: variant('markdown_list') }
};

export const RichText: Story = {
  args: { block: variant('rich_text_section') }
};

export const Table: Story = {
  args: { block: variant('table_simple') }
};

export const Alert: Story = {
  args: { block: variant('alert_warning') }
};

export const Card: Story = {
  args: { block: variant('card_with_hero') }
};

export const Carousel: Story = {
  args: { block: variant('carousel_basic') }
};

export const ContextActions: Story = {
  args: { block: variant('context_actions_feedback_and_remove') }
};

/* ----------------------------- Input variants ----------------------------- */

// Input is the block with the widest sub-editor surface area: 20+ element
// types, each rendering a different combination of action_id, placeholder,
// initial value, options list, max-selected, etc. One story per element
// type so the catalog covers every code path in input-editor.tsx.

export const InputPlainText: Story = {
  args: { block: variant('input_plain_text') }
};

export const InputMultilineText: Story = {
  args: { block: variant('input_multiline_text') }
};

export const InputEmail: Story = {
  args: { block: variant('input_email') }
};

export const InputURL: Story = {
  args: { block: variant('input_url') }
};

export const InputNumber: Story = {
  args: { block: variant('input_number') }
};

export const InputDate: Story = {
  args: { block: variant('input_date') }
};

export const InputTime: Story = {
  args: { block: variant('input_time') }
};

export const InputDateTime: Story = {
  args: { block: variant('input_datetime') }
};

export const InputStaticSelect: Story = {
  args: { block: variant('input_static_select') }
};

export const InputMultiStaticSelect: Story = {
  args: { block: variant('input_multi_static_select') }
};

export const InputUsersSelect: Story = {
  args: { block: variant('input_users_select') }
};

export const InputMultiUsersSelect: Story = {
  args: { block: variant('input_multi_users_select') }
};

export const InputChannelsSelect: Story = {
  args: { block: variant('input_channels_select') }
};

export const InputMultiChannelsSelect: Story = {
  args: { block: variant('input_multi_channels_select') }
};

export const InputConversationsSelect: Story = {
  args: { block: variant('input_conversations_select') }
};

export const InputMultiConversationsSelect: Story = {
  args: { block: variant('input_multi_conversations_select') }
};

export const InputExternalSelect: Story = {
  args: { block: variant('input_external_select') }
};

export const InputMultiExternalSelect: Story = {
  args: { block: variant('input_multi_external_select') }
};

export const InputRadioButtons: Story = {
  args: { block: variant('input_radio_buttons') }
};

export const InputCheckboxes: Story = {
  args: { block: variant('input_checkboxes') }
};

export const InputRichText: Story = {
  args: { block: variant('input_rich_text') }
};

export const InputFile: Story = {
  args: { block: variant('input_file') }
};

/* ---------------------------- Validation state ---------------------------- */

export const WithValidationErrors: Story = {
  args: {
    block: { type: 'header', text: { type: 'plain_text', text: '', emoji: true } },
    errors: ['Header text is required.', 'Header text cannot be empty.']
  }
};

/* ------------------------------ Interaction ------------------------------ */

export const TypingSectionTextInvokesOnChange: Story = {
  args: { block: variant('section_mrkdwn') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByLabelText(/^text$/i);
    await userEvent.click(textarea);
    await userEvent.keyboard(' Edited.');
    await expect(args.onChange).toHaveBeenCalled();
  }
};
