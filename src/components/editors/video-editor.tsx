import { Input } from '../../lib/ui/input';
import { Textarea } from '../../lib/ui/textarea';
import type { VideoBlock } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

/**
 * Editor form for video blocks. Edits the title, alt text, thumbnail/video
 * URLs, and optional provider/author/description metadata. Sending a video
 * block from Slack requires the `links.embed:write` OAuth scope and a
 * `video_url` inside the app's configured unfurl domains — the builder
 * does not enforce that here; it just edits the payload.
 * @param props - editor props
 * @param props.block - the video block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered video editor form
 */
export function VideoEditor({ block, onChange }: BlockEditorProps<VideoBlock>) {
  return (
    <div className="flex flex-col gap-4">
      <EditorField label="Title" help="Up to 199 characters. Shown above the embedded player." htmlFor="video-title">
        <Input
          id="video-title"
          value={block.title?.text ?? ''}
          maxLength={199}
          placeholder="e.g. Product demo"
          onChange={(e) =>
            onChange({
              ...block,
              title: { type: 'plain_text', text: e.target.value, emoji: true }
            })
          }
        />
      </EditorField>

      <EditorField label="Alt text" help="Tooltip for the video. Required for accessibility." htmlFor="video-alt">
        <Input
          id="video-alt"
          value={block.alt_text ?? ''}
          placeholder="e.g. A short walkthrough of the new release"
          onChange={(e) => onChange({ ...block, alt_text: e.target.value })}
        />
      </EditorField>

      <EditorField
        label="Video URL"
        help="HTTPS embed URL. Must match an unfurl domain on your Slack app."
        htmlFor="video-url"
      >
        <Input
          id="video-url"
          type="url"
          value={block.video_url ?? ''}
          placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
          onChange={(e) => onChange({ ...block, video_url: e.target.value })}
        />
      </EditorField>

      <EditorField label="Thumbnail URL" help="Preview image shown before the video loads." htmlFor="video-thumbnail">
        <Input
          id="video-thumbnail"
          type="url"
          value={block.thumbnail_url ?? ''}
          placeholder="e.g. https://example.com/thumb.png"
          onChange={(e) => onChange({ ...block, thumbnail_url: e.target.value })}
        />
      </EditorField>

      <EditorField
        label="Title link URL"
        help="Optional. HTTPS link the title text opens (the non-embed page)."
        htmlFor="video-title-url"
      >
        <Input
          id="video-title-url"
          type="url"
          value={block.title_url ?? ''}
          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          onChange={(e) => onChange({ ...block, title_url: e.target.value || undefined })}
        />
      </EditorField>

      <EditorField label="Description" help="Optional. Up to 199 characters." htmlFor="video-description">
        <Textarea
          id="video-description"
          value={block.description?.text ?? ''}
          maxLength={199}
          rows={2}
          placeholder="e.g. A short walkthrough of the new release."
          onChange={(e) =>
            onChange({
              ...block,
              description: e.target.value ? { type: 'plain_text', text: e.target.value, emoji: true } : undefined
            })
          }
        />
      </EditorField>

      <EditorField label="Author name" help="Optional. Up to 49 characters." htmlFor="video-author">
        <Input
          id="video-author"
          value={block.author_name ?? ''}
          maxLength={49}
          placeholder="e.g. Acme"
          onChange={(e) => onChange({ ...block, author_name: e.target.value || undefined })}
        />
      </EditorField>

      <EditorField
        label="Provider name"
        help="Optional. Originating service (e.g. YouTube, Vimeo)."
        htmlFor="video-provider-name"
      >
        <Input
          id="video-provider-name"
          value={block.provider_name ?? ''}
          placeholder="e.g. YouTube"
          onChange={(e) => onChange({ ...block, provider_name: e.target.value || undefined })}
        />
      </EditorField>

      <EditorField
        label="Provider icon URL"
        help="Optional. Small icon shown next to the provider name."
        htmlFor="video-provider-icon"
      >
        <Input
          id="video-provider-icon"
          type="url"
          value={block.provider_icon_url ?? ''}
          placeholder="e.g. https://example.com/youtube-favicon.png"
          onChange={(e) => onChange({ ...block, provider_icon_url: e.target.value || undefined })}
        />
      </EditorField>
    </div>
  );
}
