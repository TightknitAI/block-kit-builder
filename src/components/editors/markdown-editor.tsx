import { Textarea } from '../../lib/ui/textarea';
import type { MarkdownBlock } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

/**
 * Editor form for markdown blocks. Single textarea for the markdown
 * source. Rendered with GFM (tables, task lists, syntax highlighting)
 * by `slack-blocks-to-jsx` in the preview.
 * @param props - editor props
 * @param props.block - the markdown block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered markdown editor form
 */
export function MarkdownEditor({ block, onChange }: BlockEditorProps<MarkdownBlock>) {
  return (
    <EditorField
      label="Markdown"
      help="Standard markdown with GFM: **bold**, _italic_, lists, tables, ```code```, [links](url)."
      htmlFor="markdown-text"
    >
      <Textarea
        id="markdown-text"
        value={block.text ?? ''}
        rows={8}
        placeholder="e.g. **Roadmap**\n\n- Item one\n- Item two"
        onChange={(e) => onChange({ ...block, text: e.target.value })}
      />
    </EditorField>
  );
}
