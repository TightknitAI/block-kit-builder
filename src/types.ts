import type {
  ActionsBlock,
  ContextBlock,
  DividerBlock,
  HeaderBlock,
  ImageBlock,
  ImageElement,
  RichTextBlock,
  SectionBlock,
  Button as SlackButton,
  ViewInputBlock
} from 'slack-web-api-client';

/**
 * The Slack Block Kit block types supported by the builder in v1.
 */
export type SupportedBlockType =
  | 'section'
  | 'header'
  | 'divider'
  | 'context'
  | 'actions'
  | 'image'
  | 'markdown'
  | 'rich_text'
  | 'table'
  | 'alert'
  | 'card'
  | 'carousel'
  | 'context_actions'
  | 'input';

/**
 * Slack `markdown` block payload. Renders standard markdown (GFM)
 * via `slack-blocks-to-jsx`'s react-markdown integration.
 * `slack-web-api-client` doesn't ship this type yet, so we declare
 * the minimal shape ourselves.
 */
export interface MarkdownBlock {
  type: 'markdown';
  text: string;
  block_id?: string;
}

/**
 * One cell in a {@link TableBlock} row. Slack accepts either a raw text
 * cell or a rich-text cell; the visual editor only emits raw text in v1
 * but preserves rich-text cells on edit.
 */
export type TableCell = { type: 'raw_text'; text: string } | { type: 'rich_text'; elements: unknown[] };

/**
 * Per-column setting in a {@link TableBlock}. May be null to skip a
 * column. Matches Slack's `table_column_setting` schema.
 */
export type TableColumnSetting = null | {
  align?: 'left' | 'center' | 'right';
  is_wrapped?: boolean;
};

/**
 * Slack `table` block payload. Up to 100 rows, 20 cells per row.
 * `slack-web-api-client` doesn't ship this type, so we declare it.
 */
export interface TableBlock {
  type: 'table';
  rows: TableCell[][];
  column_settings?: TableColumnSetting[];
  block_id?: string;
}

/**
 * Severity level for an {@link AlertBlock}. Controls the icon and color
 * accent rendered by Slack. Defaults to `default` when omitted.
 */
export type AlertLevel = 'default' | 'info' | 'warning' | 'error' | 'success';

/**
 * Slack `alert` block payload. Single-line status notification with an
 * optional severity level. Per Slack's surface compatibility rules, alert
 * blocks render on modal surfaces only (not messages or home tabs).
 * `slack-web-api-client` doesn't ship this type yet, so we declare it.
 */
export interface AlertBlock {
  type: 'alert';
  text: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
    verbatim?: boolean;
  };
  level?: AlertLevel;
  block_id?: string;
}

/**
 * Slack `card` block payload. Renders a media-rich card with optional
 * hero image, icon, title, subtitle, body, and action buttons. At least
 * one of `hero_image`, `title`, `actions`, or `body` is required.
 * `slack-web-api-client` doesn't ship this type yet, so we declare it.
 */
export interface CardBlock {
  type: 'card';
  block_id?: string;
  hero_image?: ImageElement;
  icon?: ImageElement;
  title?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
    verbatim?: boolean;
  };
  subtitle?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
    verbatim?: boolean;
  };
  body?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
    verbatim?: boolean;
  };
  actions?: SlackButton[];
}

/**
 * Slack `carousel` block payload. A horizontally scrollable group of
 * 1-10 {@link CardBlock} elements. `slack-web-api-client` doesn't ship
 * this type yet, so we declare it.
 */
export interface CarouselBlock {
  type: 'carousel';
  elements: CardBlock[];
  block_id?: string;
}

/**
 * Sub-button used inside a {@link FeedbackButtonsElement}.
 */
export interface FeedbackButtonSubobject {
  text: { type: 'plain_text'; text: string; emoji?: boolean };
  value: string;
  accessibility_label?: string;
}

/**
 * `feedback_buttons` element. Pair of positive/negative buttons used
 * inside a {@link ContextActionsBlock} (e.g. "Good Response" / "Bad
 * Response" thumbs).
 */
export interface FeedbackButtonsElement {
  type: 'feedback_buttons';
  positive_button: FeedbackButtonSubobject;
  negative_button: FeedbackButtonSubobject;
  action_id?: string;
}

/**
 * Slack icon names valid on an {@link IconButtonElement}. Slack only
 * ships `trash` today; widen as Slack adds more.
 */
export type IconButtonIcon = 'trash';

/**
 * `icon_button` element. Compact icon-with-label button used inside a
 * {@link ContextActionsBlock} (e.g. a "Remove" trash-icon button).
 */
export interface IconButtonElement {
  type: 'icon_button';
  icon: IconButtonIcon;
  text: { type: 'plain_text'; text: string; emoji?: boolean };
  action_id?: string;
  value?: string;
  accessibility_label?: string;
}

/**
 * Element accepted by a {@link ContextActionsBlock}.
 */
export type ContextActionsElement = FeedbackButtonsElement | IconButtonElement;

/**
 * Slack `context_actions` block payload. Renders a row of contextual
 * action buttons (1-5 elements) attached to a message. Only valid on
 * the message surface; the validator already encodes that.
 * `slack-web-api-client` doesn't ship this type yet, so we declare it.
 */
export interface ContextActionsBlock {
  type: 'context_actions';
  elements: ContextActionsElement[];
  block_id?: string;
}

/**
 * Slack `input` block payload. Aliased to `ViewInputBlock` from
 * `slack-web-api-client`, which is the superset that accepts every
 * supported input element (including `rich_text_input` and `file_input`).
 * Surface compatibility (input is valid on modal and home tab; some
 * elements are modal-only) is enforced by the validator, not the type.
 */
export type InputBlock = ViewInputBlock;

/**
 * Header heading level shown in the preview. Slack's API has no
 * `level` field on header blocks, so this is a builder-only extension
 * that round-trips on the block payload but is otherwise cosmetic.
 */
export type HeaderLevel = 1 | 2 | 3 | 4;

/**
 * Header block as edited by the builder. Extends Slack's HeaderBlock
 * with an optional {@link HeaderLevel}.
 */
export type SupportedHeaderBlock = HeaderBlock & { level?: HeaderLevel };

/**
 * Discriminated union of supported block payload shapes.
 * Subset of {@link AnyMessageBlock} from `slack-web-api-client`,
 * plus a header `level` extension.
 */
export type SupportedBlock =
  | SectionBlock
  | SupportedHeaderBlock
  | DividerBlock
  | ContextBlock
  | ActionsBlock
  | ImageBlock
  | MarkdownBlock
  | RichTextBlock
  | TableBlock
  | AlertBlock
  | CardBlock
  | CarouselBlock
  | ContextActionsBlock
  | InputBlock;

/**
 * A block as represented inside the builder's working state.
 * `id` is an ephemeral client-side identifier used by DnD and selection.
 * It is stripped before serialization to Slack.
 */
export interface BuilderBlock {
  id: string;
  block: SupportedBlock;
}

/**
 * Channel record returned by {@link BlockKitBuilderProps.loadChannels}.
 */
export interface ChannelOption {
  id: string;
  name: string;
}

/**
 * User-token status returned by {@link BlockKitBuilderProps.loadSendAsUserStatus}.
 * If `canSendAsUser` is false, `oauthUrl` is required so the UI can show a
 * "Sign in with Slack" link.
 */
export interface SendAsUserStatus {
  canSendAsUser: boolean;
  oauthUrl?: string;
}

/**
 * Payload passed to {@link BlockKitBuilderProps.onSend}.
 */
export interface SendPayload {
  channelId: string;
  blocks: SupportedBlock[];
  sendAsUser: boolean;
}

/**
 * Result returned from {@link BlockKitBuilderProps.onSend}.
 * `error` is a human-readable message; the dialog renders it as-is.
 */
export interface SendResult {
  ok: boolean;
  error?: string;
}

/**
 * Hooks forwarded to `slack-blocks-to-jsx`'s `<Message>` so the consumer can
 * resolve user mentions, channel mentions, custom emojis, and links to
 * application-specific UI. See the upstream library for the full hook shape.
 * Marked as `unknown`-keyed at this layer to avoid leaking the upstream
 * library's internal types into our public API.
 */
export type PreviewHooks = Record<string, unknown>;

/**
 * Light or dark theme for the rendered Slack preview. Wired to
 * `slack-blocks-to-jsx`'s `theme` prop and `data-theme` attribute.
 */
export type PreviewTheme = 'light' | 'dark';

/**
 * Which Slack surface the preview is approximating. Affects the
 * chrome rendered around the block list (message header, modal frame,
 * or app home tab).
 */
export type PreviewSurface = 'message' | 'modal' | 'app_home';

/**
 * Props for the top-level {@link BlockKitBuilder} component.
 * The package is integration-agnostic: every I/O concern is brokered
 * through these props. The component never makes a network call itself.
 */
export interface BlockKitBuilderProps {
  /**
   * Workspace name shown in the preview chrome to mimic a Slack message header.
   * Cosmetic only.
   */
  workspaceName?: string;
  /**
   * Initial draft blocks. If omitted the builder starts empty.
   */
  initialBlocks?: SupportedBlock[];
  /**
   * Fires whenever the draft state changes. Use to persist the draft
   * (URL search param, localStorage, etc).
   */
  onChange?: (blocks: SupportedBlock[]) => void;
  /**
   * Optional hooks forwarded to the underlying `<Message>` component for
   * resolving user / channel / emoji directives. If omitted, those
   * directives render with the library's defaults.
   */
  previewHooks?: PreviewHooks;
  /**
   * Returns channels available to send to. Called when the send dialog opens.
   */
  loadChannels: () => Promise<ChannelOption[]>;
  /**
   * Returns whether the current user can post as themselves and, if not, an
   * OAuth URL to start the install flow.
   */
  loadSendAsUserStatus: () => Promise<SendAsUserStatus>;
  /**
   * Called when the user submits the send dialog. Should return
   * `{ ok: true }` on success or `{ ok: false, error }` on failure.
   */
  onSend: (payload: SendPayload) => Promise<SendResult>;
  /**
   * Which Slack block types appear in the palette. When omitted, every
   * supported type is shown. When provided, the palette is filtered to
   * the listed types — useful for restricting the builder to a curated
   * subset (e.g. a message-only app might omit `input` and `alert`).
   * An empty array renders an empty palette.
   */
  allowedBlockTypes?: readonly SupportedBlockType[];
  /**
   * Which Slack preview surfaces the toolbar exposes. Defaults to
   * `['message']`, which locks the preview to Message and hides the
   * surface dropdown. Pass two or more to show the dropdown with those
   * options; the first entry becomes the initial selection.
   */
  allowedSurfaces?: readonly PreviewSurface[];
  /**
   * Whether the toolbar exposes the light/dark theme dropdown.
   * Defaults to `true`. When `false`, the theme is locked to
   * {@link PreviewTheme} `'light'`.
   */
  showThemeControl?: boolean;
  /**
   * Initial preview theme. Defaults to `'light'`. Pass the host app's
   * current theme (e.g. from `next-themes` or your own theme hook) so
   * the preview opens matched to the consuming app's appearance. The
   * user can still override via the toolbar dropdown if
   * {@link BlockKitBuilderProps.showThemeControl} is `true`.
   */
  defaultPreviewTheme?: PreviewTheme;
}
