import type { SupportedBlock, SupportedBlockType } from '../types';

/**
 * One pre-built block example shown as a draggable item in the palette.
 * Modeled on Slack's real Block Kit Builder ("plain text", "mrkdwn",
 * "with button accessory", etc).
 */
export interface PaletteVariant {
  /** Stable id used as the DnD draggable id (`palette:${id}`). */
  id: string;
  /** Visible label shown next to the `+` icon. */
  label: string;
  /** Builds a fresh block payload when this variant is dropped. */
  factory: () => SupportedBlock;
}

/**
 * One section in the palette. Sections group variants under a block-type
 * heading, matching Slack's organization (Section, Divider, Image, etc).
 */
export interface PaletteSection {
  /** Visible heading for the section. */
  name: string;
  /** The block type this section is for, used for section-icon mapping. */
  blockType: SupportedBlockType;
  variants: PaletteVariant[];
}

/**
 * The palette layout. Mirrors the section ordering of Slack's real Block
 * Kit Builder, scoped to the v1 supported block types.
 */
export const PALETTE_SECTIONS: readonly PaletteSection[] = [
  {
    name: 'Rich Text',
    blockType: 'rich_text',
    variants: [
      {
        id: 'rich_text_section',
        label: 'section',
        factory: () => ({
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                { type: 'text', text: 'A rich text ' },
                { type: 'text', text: 'section', style: { bold: true } },
                { type: 'text', text: ' with inline ' },
                { type: 'text', text: 'styled', style: { italic: true } },
                { type: 'text', text: ' text.' }
              ]
            }
          ]
        })
      }
    ]
  },
  {
    name: 'Markdown',
    blockType: 'markdown',
    variants: [
      {
        id: 'markdown_basic',
        label: 'basic',
        factory: () => ({
          type: 'markdown',
          text: 'A **markdown** block. Supports _italic_, ~~strike~~, `code`, [links](https://slack.com), lists, tables, and task lists.'
        })
      },
      {
        id: 'markdown_list',
        label: 'list',
        factory: () => ({
          type: 'markdown',
          text: '**Roadmap**\n\n- Item one\n- Item two\n- Item three'
        })
      },
      {
        id: 'markdown_code',
        label: 'code block',
        factory: () => ({
          type: 'markdown',
          // biome-ignore lint/suspicious/noTemplateCurlyInString: literal markdown source for a code-block sample
          text: '```ts\nconst greet = (name: string) => `Hello, ${name}!`;\n```'
        })
      }
    ]
  },
  {
    name: 'Section',
    blockType: 'section',
    variants: [
      {
        id: 'section_plain_text',
        label: 'plain text',
        factory: () => ({
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'A simple plain-text section.',
            emoji: true
          }
        })
      },
      {
        id: 'section_mrkdwn',
        label: 'mrkdwn',
        factory: () => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'A *markdown* section. Supports _italic_, ~strike~, `code`, and <https://slack.com|links>.'
          }
        })
      },
      {
        id: 'section_with_button',
        label: 'with button accessory',
        factory: () => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'A section with a button accessory on the right.'
          },
          accessory: {
            type: 'button',
            text: { type: 'plain_text', text: 'Click me', emoji: true },
            action_id: 'section_button'
          }
        })
      },
      {
        id: 'section_with_image',
        label: 'with image accessory',
        factory: () => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'A section with an image accessory on the right.'
          },
          accessory: {
            type: 'image',
            image_url: 'https://placehold.co/80x80?text=Img',
            alt_text: 'Placeholder accessory image'
          }
        })
      }
    ]
  },
  {
    name: 'Header',
    blockType: 'header',
    variants: [
      {
        id: 'header_default',
        label: 'default',
        factory: () => ({
          type: 'header',
          text: { type: 'plain_text', text: 'Heading text', emoji: true }
        })
      }
    ]
  },
  {
    name: 'Divider',
    blockType: 'divider',
    variants: [
      {
        id: 'divider_plain',
        label: 'plain',
        factory: () => ({ type: 'divider' })
      }
    ]
  },
  {
    name: 'Image',
    blockType: 'image',
    variants: [
      {
        id: 'image_with_title',
        label: 'with title',
        factory: () => ({
          type: 'image',
          image_url: 'https://placehold.co/600x300?text=Image',
          alt_text: 'Placeholder image',
          title: { type: 'plain_text', text: 'Image title', emoji: true }
        })
      },
      {
        id: 'image_no_title',
        label: 'no title',
        factory: () => ({
          type: 'image',
          image_url: 'https://placehold.co/600x300?text=Image',
          alt_text: 'Placeholder image'
        })
      }
    ]
  },
  {
    name: 'Context',
    blockType: 'context',
    variants: [
      {
        id: 'context_plain_text',
        label: 'plain text',
        factory: () => ({
          type: 'context',
          elements: [{ type: 'plain_text', text: 'Posted by your app', emoji: true }]
        })
      },
      {
        id: 'context_mrkdwn',
        label: 'mrkdwn',
        factory: () => ({
          type: 'context',
          elements: [{ type: 'mrkdwn', text: 'Posted by *your app*' }]
        })
      },
      {
        id: 'context_text_and_images',
        label: 'text and images',
        factory: () => ({
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url: 'https://placehold.co/40x40?text=A',
              alt_text: 'Avatar'
            },
            { type: 'mrkdwn', text: '*Alex* posted in <#general>' }
          ]
        })
      }
    ]
  },
  {
    name: 'Actions',
    blockType: 'actions',
    variants: [
      {
        id: 'actions_button',
        label: 'button',
        factory: () => ({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Click me', emoji: true },
              action_id: 'button_1'
            }
          ]
        })
      },
      {
        id: 'actions_link_button',
        label: 'link button',
        factory: () => ({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Open link', emoji: true },
              url: 'https://slack.com',
              action_id: 'link_button_1'
            }
          ]
        })
      },
      {
        id: 'actions_multiple_buttons',
        label: 'multiple buttons',
        factory: () => ({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Approve', emoji: true },
              style: 'primary',
              action_id: 'approve'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Deny', emoji: true },
              style: 'danger',
              action_id: 'deny'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Cancel', emoji: true },
              action_id: 'cancel'
            }
          ]
        })
      }
    ]
  },
  {
    name: 'Input',
    blockType: 'input',
    variants: [
      {
        id: 'input_plain_text',
        label: 'plain text',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Label', emoji: true },
          element: {
            type: 'plain_text_input',
            action_id: 'plain_text_input',
            placeholder: {
              type: 'plain_text',
              text: 'Enter some text',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_multiline_text',
        label: 'multiline text',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Description', emoji: true },
          element: {
            type: 'plain_text_input',
            action_id: 'plain_text_input_multiline',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Enter a longer description',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_email',
        label: 'email',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Email address', emoji: true },
          element: {
            type: 'email_text_input',
            action_id: 'email_text_input',
            placeholder: {
              type: 'plain_text',
              text: 'name@example.com',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_url',
        label: 'url',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Website', emoji: true },
          element: {
            type: 'url_text_input',
            action_id: 'url_text_input',
            placeholder: {
              type: 'plain_text',
              text: 'https://example.com',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_number',
        label: 'number',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Quantity', emoji: true },
          element: {
            type: 'number_input',
            action_id: 'number_input',
            is_decimal_allowed: false,
            placeholder: { type: 'plain_text', text: '0', emoji: true }
          }
        })
      },
      {
        id: 'input_date',
        label: 'date',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick a date', emoji: true },
          element: {
            type: 'datepicker',
            action_id: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'Select a date',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_time',
        label: 'time',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick a time', emoji: true },
          element: {
            type: 'timepicker',
            action_id: 'timepicker',
            placeholder: {
              type: 'plain_text',
              text: 'Select a time',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_datetime',
        label: 'date and time',
        factory: () => ({
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Pick a date and time',
            emoji: true
          },
          element: {
            type: 'datetimepicker',
            action_id: 'datetimepicker'
          }
        })
      },
      {
        id: 'input_static_select',
        label: 'select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick an option', emoji: true },
          element: {
            type: 'static_select',
            action_id: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Choose one',
              emoji: true
            },
            options: [
              {
                text: { type: 'plain_text', text: 'Option 1', emoji: true },
                value: 'option_1'
              },
              {
                text: { type: 'plain_text', text: 'Option 2', emoji: true },
                value: 'option_2'
              },
              {
                text: { type: 'plain_text', text: 'Option 3', emoji: true },
                value: 'option_3'
              }
            ]
          }
        })
      },
      {
        id: 'input_multi_static_select',
        label: 'multi-select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick options', emoji: true },
          element: {
            type: 'multi_static_select',
            action_id: 'multi_static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Choose one or more',
              emoji: true
            },
            options: [
              {
                text: { type: 'plain_text', text: 'Option 1', emoji: true },
                value: 'option_1'
              },
              {
                text: { type: 'plain_text', text: 'Option 2', emoji: true },
                value: 'option_2'
              },
              {
                text: { type: 'plain_text', text: 'Option 3', emoji: true },
                value: 'option_3'
              }
            ]
          }
        })
      },
      {
        id: 'input_users_select',
        label: 'users select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick a user', emoji: true },
          element: {
            type: 'users_select',
            action_id: 'users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select a user',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_multi_users_select',
        label: 'multi users select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick users', emoji: true },
          element: {
            type: 'multi_users_select',
            action_id: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_channels_select',
        label: 'channels select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick a channel', emoji: true },
          element: {
            type: 'channels_select',
            action_id: 'channels_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select a channel',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_multi_channels_select',
        label: 'multi channels select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick channels', emoji: true },
          element: {
            type: 'multi_channels_select',
            action_id: 'multi_channels_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select channels',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_conversations_select',
        label: 'conversations select',
        factory: () => ({
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Pick a conversation',
            emoji: true
          },
          element: {
            type: 'conversations_select',
            action_id: 'conversations_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select a conversation',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_multi_conversations_select',
        label: 'multi conversations select',
        factory: () => ({
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Pick conversations',
            emoji: true
          },
          element: {
            type: 'multi_conversations_select',
            action_id: 'multi_conversations_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select conversations',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_external_select',
        label: 'external select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick an option', emoji: true },
          element: {
            type: 'external_select',
            action_id: 'external_select',
            placeholder: {
              type: 'plain_text',
              text: 'Choose one',
              emoji: true
            },
            min_query_length: 0
          }
        })
      },
      {
        id: 'input_multi_external_select',
        label: 'multi external select',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick options', emoji: true },
          element: {
            type: 'multi_external_select',
            action_id: 'multi_external_select',
            placeholder: {
              type: 'plain_text',
              text: 'Choose one or more',
              emoji: true
            },
            min_query_length: 0
          }
        })
      },
      {
        id: 'input_radio_buttons',
        label: 'radio buttons',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick one', emoji: true },
          element: {
            type: 'radio_buttons',
            action_id: 'radio_buttons',
            options: [
              {
                text: { type: 'plain_text', text: 'Option 1', emoji: true },
                value: 'option_1'
              },
              {
                text: { type: 'plain_text', text: 'Option 2', emoji: true },
                value: 'option_2'
              },
              {
                text: { type: 'plain_text', text: 'Option 3', emoji: true },
                value: 'option_3'
              }
            ]
          }
        })
      },
      {
        id: 'input_checkboxes',
        label: 'checkboxes',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Pick any', emoji: true },
          element: {
            type: 'checkboxes',
            action_id: 'checkboxes',
            options: [
              {
                text: { type: 'plain_text', text: 'Option 1', emoji: true },
                value: 'option_1'
              },
              {
                text: { type: 'plain_text', text: 'Option 2', emoji: true },
                value: 'option_2'
              },
              {
                text: { type: 'plain_text', text: 'Option 3', emoji: true },
                value: 'option_3'
              }
            ]
          }
        })
      },
      {
        id: 'input_rich_text',
        label: 'rich text input',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Description', emoji: true },
          element: {
            type: 'rich_text_input',
            action_id: 'rich_text_input',
            placeholder: {
              type: 'plain_text',
              text: 'Type something',
              emoji: true
            }
          }
        })
      },
      {
        id: 'input_file',
        label: 'file upload',
        factory: () => ({
          type: 'input',
          label: { type: 'plain_text', text: 'Upload a file', emoji: true },
          element: {
            type: 'file_input',
            action_id: 'file_input',
            max_files: 1
          }
        })
      }
    ]
  },
  {
    name: 'Card',
    blockType: 'card',
    variants: [
      {
        id: 'card_basic',
        label: 'basic',
        factory: () => ({
          type: 'card',
          icon: {
            type: 'image',
            image_url: 'https://placehold.co/36x36?text=Icon',
            alt_text: 'Card icon'
          },
          title: { type: 'mrkdwn', text: 'Card title' },
          subtitle: { type: 'mrkdwn', text: 'Card subtitle' },
          body: {
            type: 'mrkdwn',
            text: 'A short description of what this card is about.'
          }
        })
      },
      {
        id: 'card_with_hero',
        label: 'with hero image',
        factory: () => ({
          type: 'card',
          hero_image: {
            type: 'image',
            image_url: 'https://placehold.co/400x200?text=Hero',
            alt_text: 'Card hero image'
          },
          title: { type: 'mrkdwn', text: 'Card title' },
          body: {
            type: 'mrkdwn',
            text: 'A short description of what this card is about.'
          }
        })
      },
      {
        id: 'card_with_actions',
        label: 'with actions',
        factory: () => ({
          type: 'card',
          title: { type: 'mrkdwn', text: 'Card title' },
          body: {
            type: 'mrkdwn',
            text: 'A short description of what this card is about.'
          },
          actions: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Open', emoji: true },
              action_id: 'card_action_1'
            }
          ]
        })
      }
    ]
  },
  {
    name: 'Carousel',
    blockType: 'carousel',
    variants: [
      {
        id: 'carousel_basic',
        label: 'basic',
        factory: () => ({
          type: 'carousel',
          elements: [
            {
              type: 'card',
              title: { type: 'mrkdwn', text: 'Card 1' },
              body: { type: 'mrkdwn', text: 'First card in the carousel.' }
            },
            {
              type: 'card',
              title: { type: 'mrkdwn', text: 'Card 2' },
              body: { type: 'mrkdwn', text: 'Second card in the carousel.' }
            },
            {
              type: 'card',
              title: { type: 'mrkdwn', text: 'Card 3' },
              body: { type: 'mrkdwn', text: 'Third card in the carousel.' }
            }
          ]
        })
      }
    ]
  },
  {
    name: 'Context Actions',
    blockType: 'context_actions',
    variants: [
      {
        id: 'context_actions_feedback_and_remove',
        label: 'feedback + remove',
        factory: () => ({
          type: 'context_actions',
          elements: [
            {
              type: 'feedback_buttons',
              action_id: 'feedback',
              positive_button: {
                text: { type: 'plain_text', text: 'Good Response' },
                value: 'positive'
              },
              negative_button: {
                text: { type: 'plain_text', text: 'Bad Response' },
                value: 'negative'
              }
            },
            {
              type: 'icon_button',
              action_id: 'remove',
              icon: 'trash',
              text: { type: 'plain_text', text: 'Remove' }
            }
          ]
        })
      },
      {
        id: 'context_actions_feedback_only',
        label: 'feedback only',
        factory: () => ({
          type: 'context_actions',
          elements: [
            {
              type: 'feedback_buttons',
              action_id: 'feedback',
              positive_button: {
                text: { type: 'plain_text', text: '👍' },
                value: 'positive'
              },
              negative_button: {
                text: { type: 'plain_text', text: '👎' },
                value: 'negative'
              }
            }
          ]
        })
      }
    ]
  },
  {
    name: 'Alert',
    blockType: 'alert',
    variants: [
      {
        id: 'alert_warning',
        label: 'warning',
        factory: () => ({
          type: 'alert',
          level: 'warning',
          text: {
            type: 'mrkdwn',
            text: 'Heads up: this action cannot be undone.'
          }
        })
      }
    ]
  },
  {
    name: 'Table',
    blockType: 'table',
    variants: [
      {
        id: 'table_simple',
        label: 'simple table',
        factory: () => ({
          type: 'table',
          rows: [
            [
              { type: 'raw_text', text: 'Header 1' },
              { type: 'raw_text', text: 'Header 2' },
              { type: 'raw_text', text: 'Header 3' }
            ],
            [
              { type: 'raw_text', text: 'Row 1, A' },
              { type: 'raw_text', text: 'Row 1, B' },
              { type: 'raw_text', text: 'Row 1, C' }
            ],
            [
              { type: 'raw_text', text: 'Row 2, A' },
              { type: 'raw_text', text: 'Row 2, B' },
              { type: 'raw_text', text: 'Row 2, C' }
            ]
          ]
        })
      }
    ]
  }
] as const;

/**
 * Lookup table mapping a variant id back to its definition. Used by the
 * DnD drop handler to resolve a `palette:${id}` drag back to a factory.
 */
export const VARIANT_BY_ID: ReadonlyMap<string, PaletteVariant> = new Map(
  PALETTE_SECTIONS.flatMap((section) => section.variants.map((v) => [v.id, v] as const))
);

/**
 * Human-readable label for a supported block type. Used in the per-block
 * popover editor heading.
 * @param type - the block type
 * @returns a short label (e.g. "Section")
 */
export function labelForBlockType(type: SupportedBlockType): string {
  switch (type) {
    case 'section':
      return 'Section';
    case 'header':
      return 'Header';
    case 'divider':
      return 'Divider';
    case 'context':
      return 'Context';
    case 'actions':
      return 'Buttons';
    case 'image':
      return 'Image';
    case 'markdown':
      return 'Markdown';
    case 'table':
      return 'Table';
    case 'rich_text':
      return 'Rich Text';
    case 'alert':
      return 'Alert';
    case 'card':
      return 'Card';
    case 'carousel':
      return 'Carousel';
    case 'context_actions':
      return 'Context Actions';
    case 'input':
      return 'Input';
  }
}
