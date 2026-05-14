import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import { Label } from '../../lib/ui/label';
import { RadioGroup, RadioGroupItem } from '../../lib/ui/radio-group';
import type {
  ContextActionsBlock,
  ContextActionsElement,
  FeedbackButtonsElement,
  IconButtonElement
} from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

const MAX_ELEMENTS = 5;
type ElementKind = 'feedback_buttons' | 'icon_button';

/**
 * Editor form for context_actions blocks. Supports the two element
 * types Slack accepts inside this block: `feedback_buttons` (paired
 * positive/negative buttons) and `icon_button` (compact icon-with-label
 * action). Up to 5 elements per block. Slack only renders this block
 * on the message surface; the validator surfaces that constraint.
 * @param props - editor props
 * @param props.block - the context_actions block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered context_actions editor form
 */
export function ContextActionsEditor({ block, onChange }: BlockEditorProps<ContextActionsBlock>) {
  const elements = block.elements ?? [];

  const updateAt = (idx: number, next: ContextActionsElement) => {
    onChange({
      ...block,
      elements: elements.map((el, i) => (i === idx ? next : el))
    });
  };
  const removeAt = (idx: number) => {
    onChange({
      ...block,
      elements: elements.filter((_, i) => i !== idx)
    });
  };
  // Random suffixes so re-adding after a delete can't collide with a
  // surviving element's action_id (Slack rejects duplicates).
  const addFeedback = () => {
    const next: FeedbackButtonsElement = {
      type: 'feedback_buttons',
      action_id: `feedback_${nanoid(6)}`,
      positive_button: {
        text: { type: 'plain_text', text: 'Good Response' },
        value: 'positive'
      },
      negative_button: {
        text: { type: 'plain_text', text: 'Bad Response' },
        value: 'negative'
      }
    };
    onChange({ ...block, elements: [...elements, next] });
  };
  const addIconButton = () => {
    const next: IconButtonElement = {
      type: 'icon_button',
      action_id: `icon_button_${nanoid(6)}`,
      icon: 'trash',
      text: { type: 'plain_text', text: 'Remove' }
    };
    onChange({ ...block, elements: [...elements, next] });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] leading-snug text-muted-foreground">
        Up to 5 elements. Renders below the message body, alongside Slack's built-in actions.
      </p>
      {elements.map((el, idx) => {
        const kind: ElementKind = el.type;
        return (
          <div key={idx} className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground capitalize">
                {kind === 'feedback_buttons' ? 'Feedback buttons' : 'Icon button'}
              </span>
              <button
                type="button"
                aria-label={`Remove ${kind}`}
                onClick={() => removeAt(idx)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {el.type === 'feedback_buttons' ? (
              <FeedbackButtonsFields element={el} idx={idx} onChange={(next) => updateAt(idx, next)} />
            ) : (
              <IconButtonFields element={el} idx={idx} onChange={(next) => updateAt(idx, next)} />
            )}
          </div>
        );
      })}
      <div className="flex flex-row gap-2">
        <Button type="button" size="sm" onClick={addFeedback} disabled={elements.length >= MAX_ELEMENTS}>
          <Plus className="h-3.5 w-3.5" /> Add feedback buttons
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={addIconButton}
          disabled={elements.length >= MAX_ELEMENTS}
        >
          <Plus className="h-3.5 w-3.5" /> Add icon button
        </Button>
      </div>
    </div>
  );
}

/**
 * Sub-editor for a `feedback_buttons` element. Edits the positive and
 * negative button labels and values plus the shared action_id.
 * @param props - field props
 * @param props.element - the feedback_buttons element to edit
 * @param props.idx - element index (used for input id collision avoidance)
 * @param props.onChange - called with the updated element
 * @returns the rendered feedback buttons fields
 */
function FeedbackButtonsFields({
  element,
  idx,
  onChange
}: {
  element: FeedbackButtonsElement;
  idx: number;
  onChange: (next: FeedbackButtonsElement) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <EditorField
        label="Action ID"
        help="Optional. Sent in the interaction payload when a button is clicked."
        htmlFor={`fb-action-${idx}`}
      >
        <Input
          id={`fb-action-${idx}`}
          value={element.action_id ?? ''}
          placeholder="e.g. feedback"
          onChange={(e) => onChange({ ...element, action_id: e.target.value || undefined })}
        />
      </EditorField>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Positive label" htmlFor={`fb-pos-text-${idx}`}>
          <Input
            id={`fb-pos-text-${idx}`}
            value={element.positive_button.text.text}
            placeholder="e.g. Good Response"
            onChange={(e) =>
              onChange({
                ...element,
                positive_button: {
                  ...element.positive_button,
                  text: { type: 'plain_text', text: e.target.value }
                }
              })
            }
          />
        </EditorField>
        <EditorField label="Positive value" htmlFor={`fb-pos-val-${idx}`}>
          <Input
            id={`fb-pos-val-${idx}`}
            value={element.positive_button.value}
            placeholder="e.g. positive"
            onChange={(e) =>
              onChange({
                ...element,
                positive_button: {
                  ...element.positive_button,
                  value: e.target.value
                }
              })
            }
          />
        </EditorField>
        <EditorField label="Negative label" htmlFor={`fb-neg-text-${idx}`}>
          <Input
            id={`fb-neg-text-${idx}`}
            value={element.negative_button.text.text}
            placeholder="e.g. Bad Response"
            onChange={(e) =>
              onChange({
                ...element,
                negative_button: {
                  ...element.negative_button,
                  text: { type: 'plain_text', text: e.target.value }
                }
              })
            }
          />
        </EditorField>
        <EditorField label="Negative value" htmlFor={`fb-neg-val-${idx}`}>
          <Input
            id={`fb-neg-val-${idx}`}
            value={element.negative_button.value}
            placeholder="e.g. negative"
            onChange={(e) =>
              onChange({
                ...element,
                negative_button: {
                  ...element.negative_button,
                  value: e.target.value
                }
              })
            }
          />
        </EditorField>
      </div>
    </div>
  );
}

/**
 * Sub-editor for an `icon_button` element. Edits the icon (Slack only
 * exposes `trash` today), label, action_id, and optional value.
 * @param props - field props
 * @param props.element - the icon_button element to edit
 * @param props.idx - element index (used for input id collision avoidance)
 * @param props.onChange - called with the updated element
 * @returns the rendered icon button fields
 */
function IconButtonFields({
  element,
  idx,
  onChange
}: {
  element: IconButtonElement;
  idx: number;
  onChange: (next: IconButtonElement) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <EditorField label="Icon" help="Slack currently exposes only the trash icon.">
        <RadioGroup
          value={element.icon}
          onValueChange={(v) => onChange({ ...element, icon: v as IconButtonElement['icon'] })}
          className="flex flex-row gap-3"
        >
          {(['trash'] as const).map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <RadioGroupItem value={i} id={`ib-icon-${idx}-${i}`} />
              <Label htmlFor={`ib-icon-${idx}-${i}`} className="text-xs capitalize">
                {i}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </EditorField>
      <EditorField label="Label" htmlFor={`ib-text-${idx}`}>
        <Input
          id={`ib-text-${idx}`}
          value={element.text.text}
          placeholder="e.g. Remove"
          onChange={(e) =>
            onChange({
              ...element,
              text: { type: 'plain_text', text: e.target.value }
            })
          }
        />
      </EditorField>
      <EditorField
        label="Action ID"
        help="Optional. Sent in the interaction payload when the button is clicked."
        htmlFor={`ib-action-${idx}`}
      >
        <Input
          id={`ib-action-${idx}`}
          value={element.action_id ?? ''}
          placeholder="e.g. remove"
          onChange={(e) => onChange({ ...element, action_id: e.target.value || undefined })}
        />
      </EditorField>
      <EditorField label="Value" help="Optional. Sent alongside action_id." htmlFor={`ib-value-${idx}`}>
        <Input
          id={`ib-value-${idx}`}
          value={element.value ?? ''}
          placeholder="e.g. delete_item"
          onChange={(e) => onChange({ ...element, value: e.target.value || undefined })}
        />
      </EditorField>
    </div>
  );
}
