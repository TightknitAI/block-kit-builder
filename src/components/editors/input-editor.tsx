import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type {
  ChannelsSelect,
  Checkboxes,
  ConversationsSelect,
  Datepicker,
  DateTimepicker,
  EmailInput,
  ExternalSelect,
  FileInput,
  MultiChannelsSelect,
  MultiConversationsSelect,
  MultiExternalSelect,
  MultiStaticSelect,
  MultiUsersSelect,
  NumberInput,
  PlainTextInput,
  PlainTextOption,
  RadioButtons,
  RichTextInput,
  StaticSelect,
  Timepicker,
  URLInput,
  UsersSelect
} from 'slack-web-api-client';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import { Label } from '../../lib/ui/label';
import type { InputBlock } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

type InputElement = InputBlock['element'];

/**
 * Editor form for input blocks. Edits the shared wrapper fields (label,
 * hint, optional, dispatch_action) plus a sub-form keyed off the
 * element type. The element's `type` is fixed once added (palette
 * variant chooses it); to switch element type, delete and re-add.
 *
 * Surface compatibility — input blocks render on modal and home tab
 * surfaces only, and `rich_text_input` / `file_input` are modal-only.
 * The validator surfaces those constraints.
 *
 * @param props - editor props
 * @param props.block - the input block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered input editor form
 */
export function InputEditor({ block, onChange }: BlockEditorProps<InputBlock>) {
  const updateElement = (next: InputElement) => {
    onChange({ ...block, element: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <EditorField label="Label" help="The visible label shown above the input." htmlFor="input-label">
        <Input
          id="input-label"
          value={block.label?.text ?? ''}
          maxLength={2000}
          placeholder="e.g. Email address"
          onChange={(e) =>
            onChange({
              ...block,
              label: { type: 'plain_text', text: e.target.value, emoji: true }
            })
          }
        />
      </EditorField>

      <EditorField label="Hint" help="Optional helper text shown below the input." htmlFor="input-hint">
        <Input
          id="input-hint"
          value={block.hint?.text ?? ''}
          maxLength={2000}
          placeholder="e.g. We'll never share this."
          onChange={(e) =>
            onChange({
              ...block,
              hint: e.target.value ? { type: 'plain_text', text: e.target.value, emoji: true } : undefined
            })
          }
        />
      </EditorField>

      <CheckboxField
        id="input-optional"
        label="Optional"
        help="If checked, the user can submit without filling this in."
        checked={block.optional === true}
        onChange={(checked) => onChange({ ...block, optional: checked ? true : undefined })}
      />

      <CheckboxField
        id="input-dispatch-action"
        label="Dispatch action"
        help="Trigger a block_actions event whenever the value changes."
        checked={block.dispatch_action === true}
        onChange={(checked) => onChange({ ...block, dispatch_action: checked ? true : undefined })}
      />

      <ElementTypeBadge type={block.element.type} />

      <ElementEditor element={block.element} onChange={updateElement} />
    </div>
  );
}

/**
 * Read-only chip showing the element's type so the user knows what
 * kind of input they're editing. We don't expose a type switcher;
 * to change type, delete and re-add.
 * @param props - props
 * @param props.type - the element type discriminator
 * @returns the rendered chip
 */
function ElementTypeBadge({ type }: { type: InputElement['type'] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Element</span>
      <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">{type}</code>
    </div>
  );
}

/**
 * Dispatches to the per-element-type sub-form. Each branch renders
 * the fields applicable to that element type.
 * @param props - props
 * @param props.element - the input element
 * @param props.onChange - called with the updated element payload
 * @returns the rendered element sub-form
 */
function ElementEditor({ element, onChange }: { element: InputElement; onChange: (next: InputElement) => void }) {
  switch (element.type) {
    case 'plain_text_input':
      return <PlainTextInputEditor element={element} onChange={onChange} />;
    case 'email_text_input':
      return <EmailInputEditor element={element} onChange={onChange} />;
    case 'url_text_input':
      return <URLInputEditor element={element} onChange={onChange} />;
    case 'number_input':
      return <NumberInputEditor element={element} onChange={onChange} />;
    case 'datepicker':
      return <DatepickerEditor element={element} onChange={onChange} />;
    case 'timepicker':
      return <TimepickerEditor element={element} onChange={onChange} />;
    case 'datetimepicker':
      return <DateTimepickerEditor element={element} onChange={onChange} />;
    case 'static_select':
      return <StaticSelectEditor element={element} onChange={onChange} />;
    case 'multi_static_select':
      return <MultiStaticSelectEditor element={element} onChange={onChange} />;
    case 'users_select':
      return <UsersSelectEditor element={element} onChange={onChange} />;
    case 'multi_users_select':
      return <MultiUsersSelectEditor element={element} onChange={onChange} />;
    case 'channels_select':
      return <ChannelsSelectEditor element={element} onChange={onChange} />;
    case 'multi_channels_select':
      return <MultiChannelsSelectEditor element={element} onChange={onChange} />;
    case 'conversations_select':
      return <ConversationsSelectEditor element={element} onChange={onChange} />;
    case 'multi_conversations_select':
      return <MultiConversationsSelectEditor element={element} onChange={onChange} />;
    case 'external_select':
      return <ExternalSelectEditor element={element} onChange={onChange} />;
    case 'multi_external_select':
      return <MultiExternalSelectEditor element={element} onChange={onChange} />;
    case 'radio_buttons':
      return <RadioButtonsEditor element={element} onChange={onChange} />;
    case 'checkboxes':
      return <CheckboxesEditor element={element} onChange={onChange} />;
    case 'rich_text_input':
      return <RichTextInputEditor element={element} onChange={onChange} />;
    case 'file_input':
      return <FileInputEditor element={element} onChange={onChange} />;
    default:
      return null;
  }
}

/**
 * Sub-editor for a `plain_text_input` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function PlainTextInputEditor({
  element,
  onChange
}: {
  element: PlainTextInput;
  onChange: (next: PlainTextInput) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField
        label="Initial value"
        help="Pre-filled value shown when the input loads."
        htmlFor="plain-text-initial"
      >
        <Input
          id="plain-text-initial"
          value={element.initial_value ?? ''}
          onChange={(e) => onChange({ ...element, initial_value: e.target.value || undefined })}
        />
      </EditorField>
      <CheckboxField
        id="plain-text-multiline"
        label="Multiline"
        help="Render as a multi-line textarea instead of a single-line input."
        checked={element.multiline === true}
        onChange={(checked) => onChange({ ...element, multiline: checked ? true : undefined })}
      />
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Min length" help="Optional. 0–3000." htmlFor="plain-text-min">
          <Input
            id="plain-text-min"
            type="number"
            min={0}
            max={3000}
            value={element.min_length ?? ''}
            onChange={(e) =>
              onChange({
                ...element,
                min_length: e.target.value ? Number(e.target.value) : undefined
              })
            }
          />
        </EditorField>
        <EditorField label="Max length" help="Optional. Up to 3000." htmlFor="plain-text-max">
          <Input
            id="plain-text-max"
            type="number"
            min={1}
            max={3000}
            value={element.max_length ?? ''}
            onChange={(e) =>
              onChange({
                ...element,
                max_length: e.target.value ? Number(e.target.value) : undefined
              })
            }
          />
        </EditorField>
      </div>
    </>
  );
}

/**
 * Sub-editor for an `email_text_input` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function EmailInputEditor({ element, onChange }: { element: EmailInput; onChange: (next: EmailInput) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField label="Initial value" help="Pre-filled email address." htmlFor="email-initial">
        <Input
          id="email-initial"
          type="email"
          value={element.initial_value ?? ''}
          onChange={(e) => onChange({ ...element, initial_value: e.target.value || undefined })}
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `url_text_input` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function URLInputEditor({ element, onChange }: { element: URLInput; onChange: (next: URLInput) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField label="Initial value" help="Pre-filled URL." htmlFor="url-initial">
        <Input
          id="url-initial"
          type="url"
          value={element.initial_value ?? ''}
          onChange={(e) => onChange({ ...element, initial_value: e.target.value || undefined })}
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `number_input` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function NumberInputEditor({ element, onChange }: { element: NumberInput; onChange: (next: NumberInput) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <CheckboxField
        id="number-decimal"
        label="Allow decimals"
        help="If unchecked, only whole numbers are accepted."
        checked={element.is_decimal_allowed === true}
        onChange={(checked) => onChange({ ...element, is_decimal_allowed: checked })}
      />
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Min value" htmlFor="number-min">
          <Input
            id="number-min"
            value={element.min_value ?? ''}
            placeholder="e.g. 0"
            onChange={(e) =>
              onChange({
                ...element,
                min_value: e.target.value || undefined
              })
            }
          />
        </EditorField>
        <EditorField label="Max value" htmlFor="number-max">
          <Input
            id="number-max"
            value={element.max_value ?? ''}
            placeholder="e.g. 100"
            onChange={(e) =>
              onChange({
                ...element,
                max_value: e.target.value || undefined
              })
            }
          />
        </EditorField>
      </div>
      <EditorField label="Initial value" htmlFor="number-initial">
        <Input
          id="number-initial"
          value={element.initial_value ?? ''}
          onChange={(e) =>
            onChange({
              ...element,
              initial_value: e.target.value || undefined
            })
          }
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `datepicker` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function DatepickerEditor({ element, onChange }: { element: Datepicker; onChange: (next: Datepicker) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField label="Initial date" help="YYYY-MM-DD. Pre-selected on load." htmlFor="date-initial">
        <Input
          id="date-initial"
          type="date"
          value={element.initial_date ?? ''}
          onChange={(e) => onChange({ ...element, initial_date: e.target.value || undefined })}
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `timepicker` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function TimepickerEditor({ element, onChange }: { element: Timepicker; onChange: (next: Timepicker) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField label="Initial time" help="HH:mm in 24-hour clock." htmlFor="time-initial">
        <Input
          id="time-initial"
          type="time"
          value={element.initial_time ?? ''}
          onChange={(e) => onChange({ ...element, initial_time: e.target.value || undefined })}
        />
      </EditorField>
      <EditorField label="Timezone" help="Optional IANA timezone, e.g. America/Los_Angeles." htmlFor="time-tz">
        <Input
          id="time-tz"
          value={element.timezone ?? ''}
          placeholder="e.g. America/Los_Angeles"
          onChange={(e) => onChange({ ...element, timezone: e.target.value || undefined })}
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `datetimepicker` element. Internally stores a Unix
 * timestamp; the editor binds it to a `datetime-local` field for UX.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function DateTimepickerEditor({
  element,
  onChange
}: {
  element: DateTimepicker;
  onChange: (next: DateTimepicker) => void;
}) {
  const initial = element.initial_date_time
    ? (() => {
        const d = new Date(element.initial_date_time * 1000);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      })()
    : '';
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <EditorField label="Initial date and time" help="Pre-selected on load." htmlFor="datetime-initial">
        <Input
          id="datetime-initial"
          type="datetime-local"
          value={initial}
          onChange={(e) => {
            const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined;
            onChange({ ...element, initial_date_time: ts });
          }}
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `static_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function StaticSelectEditor({ element, onChange }: { element: StaticSelect; onChange: (next: StaticSelect) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <PlainTextOptionsField
        options={element.options ?? []}
        onChange={(next) => onChange({ ...element, options: next })}
      />
    </>
  );
}

/**
 * Sub-editor for a `multi_static_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function MultiStaticSelectEditor({
  element,
  onChange
}: {
  element: MultiStaticSelect;
  onChange: (next: MultiStaticSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <PlainTextOptionsField
        options={element.options ?? []}
        onChange={(next) => onChange({ ...element, options: next })}
      />
      <MaxSelectedField element={element} onChange={onChange} />
    </>
  );
}

/**
 * Sub-editor for a `users_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function UsersSelectEditor({ element, onChange }: { element: UsersSelect; onChange: (next: UsersSelect) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField label="Initial user ID" help="Optional. Pre-selects this Slack user." htmlFor="users-initial">
        <Input
          id="users-initial"
          value={element.initial_user ?? ''}
          placeholder="e.g. U0123456"
          onChange={(e) => onChange({ ...element, initial_user: e.target.value || undefined })}
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `multi_users_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function MultiUsersSelectEditor({
  element,
  onChange
}: {
  element: MultiUsersSelect;
  onChange: (next: MultiUsersSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <MaxSelectedField element={element} onChange={onChange} />
    </>
  );
}

/**
 * Sub-editor for a `channels_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function ChannelsSelectEditor({
  element,
  onChange
}: {
  element: ChannelsSelect;
  onChange: (next: ChannelsSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField label="Initial channel ID" help="Optional. Pre-selects this channel." htmlFor="channels-initial">
        <Input
          id="channels-initial"
          value={element.initial_channel ?? ''}
          placeholder="e.g. C0123456"
          onChange={(e) =>
            onChange({
              ...element,
              initial_channel: e.target.value || undefined
            })
          }
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `multi_channels_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function MultiChannelsSelectEditor({
  element,
  onChange
}: {
  element: MultiChannelsSelect;
  onChange: (next: MultiChannelsSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <MaxSelectedField element={element} onChange={onChange} />
    </>
  );
}

/**
 * Sub-editor for a `conversations_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function ConversationsSelectEditor({
  element,
  onChange
}: {
  element: ConversationsSelect;
  onChange: (next: ConversationsSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField
        label="Initial conversation ID"
        help="Optional. Pre-selects this conversation."
        htmlFor="convos-initial"
      >
        <Input
          id="convos-initial"
          value={element.initial_conversation ?? ''}
          placeholder="e.g. C0123456 or D0123456"
          onChange={(e) =>
            onChange({
              ...element,
              initial_conversation: e.target.value || undefined
            })
          }
        />
      </EditorField>
      <CheckboxField
        id="convos-default-current"
        label="Default to current conversation"
        help="If checked, defaults to the conversation the modal was opened from."
        checked={element.default_to_current_conversation === true}
        onChange={(checked) =>
          onChange({
            ...element,
            default_to_current_conversation: checked ? true : undefined
          })
        }
      />
    </>
  );
}

/**
 * Sub-editor for a `multi_conversations_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function MultiConversationsSelectEditor({
  element,
  onChange
}: {
  element: MultiConversationsSelect;
  onChange: (next: MultiConversationsSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <MaxSelectedField element={element} onChange={onChange} />
      <CheckboxField
        id="multi-convos-default-current"
        label="Default to current conversation"
        help="If checked, defaults to the conversation the modal was opened from."
        checked={element.default_to_current_conversation === true}
        onChange={(checked) =>
          onChange({
            ...element,
            default_to_current_conversation: checked ? true : undefined
          })
        }
      />
    </>
  );
}

/**
 * Sub-editor for an `external_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function ExternalSelectEditor({
  element,
  onChange
}: {
  element: ExternalSelect;
  onChange: (next: ExternalSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField
        label="Min query length"
        help="Characters typed before Slack fetches options from your app."
        htmlFor="external-min-q"
      >
        <Input
          id="external-min-q"
          type="number"
          min={0}
          value={element.min_query_length ?? ''}
          onChange={(e) =>
            onChange({
              ...element,
              min_query_length: e.target.value ? Number(e.target.value) : undefined
            })
          }
        />
      </EditorField>
    </>
  );
}

/**
 * Sub-editor for a `multi_external_select` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function MultiExternalSelectEditor({
  element,
  onChange
}: {
  element: MultiExternalSelect;
  onChange: (next: MultiExternalSelect) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <EditorField
        label="Min query length"
        help="Characters typed before Slack fetches options from your app."
        htmlFor="multi-external-min-q"
      >
        <Input
          id="multi-external-min-q"
          type="number"
          min={0}
          value={element.min_query_length ?? ''}
          onChange={(e) =>
            onChange({
              ...element,
              min_query_length: e.target.value ? Number(e.target.value) : undefined
            })
          }
        />
      </EditorField>
      <MaxSelectedField element={element} onChange={onChange} />
    </>
  );
}

/**
 * Sub-editor for a `radio_buttons` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function RadioButtonsEditor({ element, onChange }: { element: RadioButtons; onChange: (next: RadioButtons) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlainTextOptionsField
        options={(element.options ?? []) as PlainTextOption[]}
        onChange={(next) => onChange({ ...element, options: next })}
      />
    </>
  );
}

/**
 * Sub-editor for a `checkboxes` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function CheckboxesEditor({ element, onChange }: { element: Checkboxes; onChange: (next: Checkboxes) => void }) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlainTextOptionsField
        options={(element.options ?? []) as PlainTextOption[]}
        onChange={(next) => onChange({ ...element, options: next })}
      />
    </>
  );
}

/**
 * Sub-editor for a `rich_text_input` element. Initial rich-text value
 * is non-trivial to edit inline; for that, use the View JSON drawer.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function RichTextInputEditor({
  element,
  onChange
}: {
  element: RichTextInput;
  onChange: (next: RichTextInput) => void;
}) {
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <PlaceholderField element={element} onChange={onChange} />
      <p className="text-[11px] leading-snug text-muted-foreground">
        Edit the initial rich-text value via the View JSON drawer.
      </p>
    </>
  );
}

/**
 * Sub-editor for a `file_input` element.
 * @param props - props
 * @param props.element - the element to edit
 * @param props.onChange - called with the updated element
 * @returns the rendered sub-form
 */
function FileInputEditor({ element, onChange }: { element: FileInput; onChange: (next: FileInput) => void }) {
  const filetypes = (element.filetypes ?? []).join(', ');
  return (
    <>
      <ActionIdField element={element} onChange={onChange} />
      <EditorField
        label="Allowed filetypes"
        help="Comma-separated extensions (e.g. jpg, png, pdf). Leave blank to allow any."
        htmlFor="file-types"
      >
        <Input
          id="file-types"
          value={filetypes}
          placeholder="e.g. jpg, png, pdf"
          onChange={(e) => {
            const list = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            onChange({
              ...element,
              filetypes: list.length > 0 ? list : undefined
            });
          }}
        />
      </EditorField>
      <EditorField label="Max files" help="Maximum number of files the user can upload (1-10)." htmlFor="file-max">
        <Input
          id="file-max"
          type="number"
          min={1}
          max={10}
          value={element.max_files ?? ''}
          onChange={(e) =>
            onChange({
              ...element,
              max_files: e.target.value ? Number(e.target.value) : undefined
            })
          }
        />
      </EditorField>
    </>
  );
}

/**
 * Shared `action_id` field. Every input element uses this to identify
 * itself in submission payloads.
 * @param props - props
 * @param props.element - the element being edited
 * @param props.onChange - called with the updated element
 * @returns the rendered field
 */
function ActionIdField<T extends { action_id?: string }>({
  element,
  onChange
}: {
  element: T;
  onChange: (next: T) => void;
}) {
  return (
    <EditorField
      label="Action ID"
      help="Unique within the view. Slack returns this with the submitted value."
      htmlFor="action-id"
    >
      <Input
        id="action-id"
        value={element.action_id ?? ''}
        placeholder="e.g. email_input"
        onChange={(e) => onChange({ ...element, action_id: e.target.value || undefined })}
      />
    </EditorField>
  );
}

/**
 * Shared placeholder field used by every element that supports
 * `placeholder` (i.e. anything implementing `Placeholdable`).
 * @param props - props
 * @param props.element - the element being edited
 * @param props.onChange - called with the updated element
 * @returns the rendered field
 */
function PlaceholderField<
  T extends {
    placeholder?: { type: 'plain_text'; text: string; emoji?: boolean };
  }
>({ element, onChange }: { element: T; onChange: (next: T) => void }) {
  return (
    <EditorField label="Placeholder" help="Greyed-out hint shown when the input is empty." htmlFor="placeholder">
      <Input
        id="placeholder"
        value={element.placeholder?.text ?? ''}
        maxLength={150}
        onChange={(e) =>
          onChange({
            ...element,
            placeholder: e.target.value ? { type: 'plain_text', text: e.target.value, emoji: true } : undefined
          })
        }
      />
    </EditorField>
  );
}

/**
 * Shared `max_selected_items` field for any multi-select element.
 * @param props - props
 * @param props.element - the element being edited
 * @param props.onChange - called with the updated element
 * @returns the rendered field
 */
function MaxSelectedField<T extends { max_selected_items?: number }>({
  element,
  onChange
}: {
  element: T;
  onChange: (next: T) => void;
}) {
  return (
    <EditorField label="Max selected items" help="Maximum number of items the user can pick." htmlFor="max-selected">
      <Input
        id="max-selected"
        type="number"
        min={1}
        value={element.max_selected_items ?? ''}
        onChange={(e) =>
          onChange({
            ...element,
            max_selected_items: e.target.value ? Number(e.target.value) : undefined
          })
        }
      />
    </EditorField>
  );
}

/**
 * Editor for a list of plain-text options. Used by static_select,
 * multi_static_select, radio_buttons, and checkboxes.
 * @param props - props
 * @param props.options - current options
 * @param props.onChange - called with the updated options array
 * @returns the rendered options editor
 */
function PlainTextOptionsField({
  options,
  onChange
}: {
  options: PlainTextOption[];
  onChange: (next: PlainTextOption[]) => void;
}) {
  const update = (idx: number, change: Partial<PlainTextOption>) => {
    onChange(options.map((o, i) => (i === idx ? { ...o, ...change } : o)));
  };
  const removeAt = (idx: number) => onChange(options.filter((_, i) => i !== idx));
  // Random suffix for `value` so re-adding after a delete can't collide
  // with a surviving option's value (Slack requires unique values per
  // select / radio / checkbox element).
  const addOption = () =>
    onChange([
      ...options,
      {
        text: {
          type: 'plain_text',
          text: `Option ${options.length + 1}`,
          emoji: true
        },
        value: `option_${nanoid(6)}`
      }
    ]);

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3">
      <span className="text-xs font-medium text-foreground">Options</span>
      {options.length === 0 ? (
        <p className="text-[11px] leading-snug text-muted-foreground">No options. Add one to populate the choices.</p>
      ) : null}
      {options.map((opt, idx) => (
        <div key={idx} className="flex flex-col gap-2 rounded border bg-background p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Option {idx + 1}</span>
            <button
              type="button"
              aria-label="Remove option"
              onClick={() => removeAt(idx)}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <EditorField label="Label" htmlFor={`option-text-${idx}`}>
            <Input
              id={`option-text-${idx}`}
              value={opt.text?.text ?? ''}
              maxLength={75}
              onChange={(e) =>
                update(idx, {
                  text: {
                    type: 'plain_text',
                    text: e.target.value,
                    emoji: true
                  }
                })
              }
            />
          </EditorField>
          <EditorField
            label="Value"
            help="Identifier returned with the submitted payload."
            htmlFor={`option-value-${idx}`}
          >
            <Input
              id={`option-value-${idx}`}
              value={opt.value ?? ''}
              maxLength={75}
              onChange={(e) => update(idx, { value: e.target.value || undefined })}
            />
          </EditorField>
        </div>
      ))}
      <Button type="button" size="sm" onClick={addOption} className="self-start">
        <Plus className="h-3.5 w-3.5" /> Add option
      </Button>
    </div>
  );
}

/**
 * Native checkbox styled to match the rest of the editor surface.
 * Used for boolean fields like `optional`, `multiline`, etc.
 * @param props - props
 * @param props.id - input element id (for label association)
 * @param props.label - visible label
 * @param props.help - optional helper text below the checkbox
 * @param props.checked - whether the checkbox is checked
 * @param props.onChange - called with the new checked state
 * @returns the rendered checkbox row
 */
function CheckboxField({
  id,
  label,
  help,
  checked,
  onChange
}: {
  id: string;
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 cursor-pointer rounded border-input"
        />
        <Label htmlFor={id} className="cursor-pointer text-xs">
          {label}
        </Label>
      </div>
      {help ? <p className="ml-5 text-[11px] leading-snug text-muted-foreground">{help}</p> : null}
    </div>
  );
}
