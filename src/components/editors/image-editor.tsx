import type { ImageBlock } from 'slack-web-api-client';
import { Input } from '../../lib/ui/input';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

/**
 * Editor form for URL-based image blocks. The Slack-file variant is not
 * editable here (it would require a file upload flow).
 * @param props - editor props
 * @param props.block - the image block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered image editor form
 */
export function ImageEditor({ block, onChange }: BlockEditorProps<ImageBlock>) {
  if (!('image_url' in block)) {
    return (
      <p className="text-xs text-muted-foreground">
        This image references a Slack file. Not editable in the visual builder.
      </p>
    );
  }

  const titleText = block.title?.text ?? '';

  return (
    <div className="flex flex-col gap-3">
      <EditorField label="Image URL" help="A publicly accessible image URL (PNG, JPG, GIF)." htmlFor="img-url">
        <Input
          id="img-url"
          type="url"
          value={block.image_url ?? ''}
          placeholder="e.g. https://example.com/cover.png"
          onChange={(e) => onChange({ ...block, image_url: e.target.value })}
        />
      </EditorField>
      <EditorField
        label="Alt text"
        help="Describes the image for screen readers and when the image fails to load."
        htmlFor="img-alt"
      >
        <Input
          id="img-alt"
          value={block.alt_text ?? ''}
          placeholder="e.g. Quarterly roadmap cover"
          onChange={(e) => onChange({ ...block, alt_text: e.target.value })}
        />
      </EditorField>
      <EditorField label="Title (optional)" help="Shown as a caption above the image." htmlFor="img-title">
        <Input
          id="img-title"
          value={titleText}
          placeholder="e.g. Q2 Roadmap"
          onChange={(e) => {
            const v = e.target.value;
            onChange({
              ...block,
              title: v ? { type: 'plain_text', text: v, emoji: true } : undefined
            });
          }}
        />
      </EditorField>
    </div>
  );
}
