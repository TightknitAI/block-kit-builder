import { Label } from '../../lib/ui/label';
import { RadioGroup, RadioGroupItem } from '../../lib/ui/radio-group';
import { Textarea } from '../../lib/ui/textarea';
import type { AlertBlock, AlertLevel } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

const LEVELS: readonly AlertLevel[] = ['default', 'info', 'warning', 'error', 'success'] as const;

/**
 * Editor form for alert blocks. Edits the message text and severity level
 * (default / info / warning / error / success). Slack renders alert blocks
 * on modal surfaces only; the validator surfaces a surface-compatibility
 * error if used elsewhere.
 * @param props - editor props
 * @param props.block - the alert block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered alert editor form
 */
export function AlertEditor({ block, onChange }: BlockEditorProps<AlertBlock>) {
  const text = block.text?.text ?? '';
  const level: AlertLevel = block.level ?? 'default';

  return (
    <div className="flex flex-col gap-4">
      <EditorField
        label="Text"
        help="Supports *bold*, _italic_, ~strike~, `code`, and <url|link> formatting."
        htmlFor="alert-text"
      >
        <Textarea
          id="alert-text"
          value={text}
          rows={3}
          placeholder="e.g. Heads up: this action cannot be undone."
          onChange={(e) =>
            onChange({
              ...block,
              text: { type: 'mrkdwn', text: e.target.value }
            })
          }
        />
      </EditorField>
      <EditorField label="Level" help="Severity controls Slack's icon and color accent.">
        <RadioGroup
          value={level}
          onValueChange={(v) => onChange({ ...block, level: v as AlertLevel })}
          className="flex flex-row flex-wrap gap-3"
        >
          {LEVELS.map((l) => (
            <div key={l} className="flex items-center gap-1.5">
              <RadioGroupItem value={l} id={`alert-level-${l}`} />
              <Label htmlFor={`alert-level-${l}`} className="text-xs capitalize">
                {l}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </EditorField>
    </div>
  );
}
