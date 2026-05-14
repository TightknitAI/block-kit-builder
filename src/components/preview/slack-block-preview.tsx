import 'slack-blocks-to-jsx/dist/style.css';

import type { Block } from 'slack-blocks-to-jsx';
import { Message } from 'slack-blocks-to-jsx';
import type { PreviewHooks, PreviewTheme, SupportedBlock } from '../../types';

/**
 * Renders a Slack block via the `slack-blocks-to-jsx` library's `<Message>`
 * component. We render exactly one block at a time so each row in the
 * surface owns its drag and edit affordances; the wrapper-less mode keeps
 * the library from injecting its own message chrome (avatar/timestamp).
 *
 * The library handles: section, header, divider, context, actions, image,
 * rich_text, file, video, and most mrkdwn / rich-text formatting.
 *
 * `previewHooks` is forwarded as-is so the consumer can resolve user /
 * channel / emoji / link directives to its own UI when desired.
 * @param props - preview props
 * @param props.block - the single block to render
 * @param props.hooks - optional directive replacement hooks
 * @param props.theme - light or dark preview theme (default 'light')
 * @returns the rendered Slack block preview
 */
export function SlackBlockPreview({
  block,
  hooks,
  theme = 'light'
}: {
  block: SupportedBlock;
  hooks?: PreviewHooks;
  theme?: PreviewTheme;
}) {
  return (
    // The library scopes all of its CSS under `#slack_blocks_to_jsx` and
    // depends on the `slack_blocks_to_jsx styles_enabled` classes plus the
    // `data-theme` attribute for its button / mention / divider styling
    // (e.g. button reset + `bg-green-primary` for primary). `<Message
    // withoutWrapper>` skips that wrapper entirely, so we re-create it
    // here without the avatar / timestamp chrome.
    <div id="slack_blocks_to_jsx" data-theme={theme} className="slack_blocks_to_jsx styles_enabled">
      <Message
        time={new Date()}
        name=""
        logo=""
        withoutWrapper
        theme={theme}
        blocks={[block as unknown as Block]}
        hooks={hooks as Record<string, unknown> | undefined}
      />
    </div>
  );
}
