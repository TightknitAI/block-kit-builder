# block-kit-builder

[![CI](https://github.com/TightknitAI/block-kit-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/TightknitAI/block-kit-builder/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@tightknitai/block-kit-builder.svg)](https://www.npmjs.com/package/@tightknitai/block-kit-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A drag-and-drop, no-code-friendly visual builder for Slack Block Kit messages, packaged as an **integration-agnostic React component**.

Inspired by [Slack's Block Kit Builder](https://app.slack.com/block-kit-builder), reimagined as an embeddable React component you can drop into your own app.

The package owns the entire builder UX — palette, sortable preview surface, per-block popover editors, send dialog. It knows nothing about how channels are listed, who the user is, or how messages are sent. The consumer wires those concerns through callback props. A working end-to-end app is shown in [block-kit-builder-template](https://github.com/TightknitAI/block-kit-builder-template).

## Install

```bash
pnpm add @tightknitai/block-kit-builder
```

Peer deps: `react`, `react-dom`.

## Usage

```tsx
import { BlockKitBuilder } from "@tightknitai/block-kit-builder";
import "@tightknitai/block-kit-builder/styles.css";

export function MyBuilderPage() {
  return (
    <BlockKitBuilder
      workspaceName="Acme Inc."
      loadChannels={async () => {
        const res = await fetch("/api/slack/channels");
        return res.json();
      }}
      loadSendAsUserStatus={async () => {
        const res = await fetch("/api/slack/me/can-send-as-user");
        return res.json();
      }}
      onSend={async ({ channelId, blocks, sendAsUser }) => {
        const res = await fetch("/api/slack/messages/send", {
          method: "POST",
          body: JSON.stringify({ channelId, blocks, sendAsUser }),
        });
        return res.json();
      }}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `workspaceName` | `string` | no | Shown in the preview chrome to mimic a real Slack message header. |
| `initialBlocks` | `SupportedBlock[]` | no | Starting draft. If omitted, the builder starts empty. |
| `onChange` | `(blocks: SupportedBlock[]) => void` | no | Fires on every state change. Use this to persist the draft (URL, localStorage, etc). |
| `loadChannels` | `() => Promise<{ id: string; name: string }[]>` | yes | Returns channels available to send to. The package never makes Slack API calls itself. |
| `loadSendAsUserStatus` | `() => Promise<{ canSendAsUser: boolean; oauthUrl?: string }>` | yes | Whether the current user has a Slack user-token and can post as themselves. If `canSendAsUser` is false, `oauthUrl` is shown as a "Sign in with Slack" link. |
| `onSend` | `(payload) => Promise<{ ok: boolean; error?: string }>` | yes | Called when the user submits the send dialog. Payload is `{ channelId, blocks, sendAsUser }`. |
| `previewHooks` | `PreviewHooks` | no | Hooks forwarded to `slack-blocks-to-jsx`'s `<Message>` for resolving user / channel / emoji directives. |
| `palette` | `PaletteSection[]` | no | The left-hand palette of draggable variants. Defaults to `defaultPalette`. Spread it to filter, reorder, or add your own pre-configured variants — see [Customizing the palette](#customizing-the-palette). |
| `allowedSurfaces` | `PreviewSurface[]` | no | Allowlist of preview surfaces (`'message'`, `'modal'`, `'app_home'`). Defaults to `['message']` — surface dropdown is hidden when only one surface is allowed. The first entry is the initial selection. |
| `showThemeControl` | `boolean` | no | Defaults to `true`. When `false`, the theme is locked to `'light'`. |
| `defaultPreviewTheme` | `'light' \| 'dark'` | no | Pass the host app's current theme so the preview opens matched to the consuming app's appearance. |
| `theme` | `BrandTheme \| BrandPreset` | no | Branding tokens applied to the builder chrome (toolbar, palette, popovers, dialogs). Accepts a `Partial<BrandTokens>` map and optional `light`/`dark` overrides. See [Styling](#styling) below. |

## Customizing the palette

The default palette ships with curated presets for every supported block type. To narrow what's available, or add your own pre-configured variants (e.g. a "Help footer" section), pass a `palette` array. Define it at module scope (or wrap in `useMemo`) so it stays referentially stable across renders.

```tsx
import {
  BlockKitBuilder,
  defaultPalette,
  type PaletteSection,
} from "@tightknitai/block-kit-builder";

const PALETTE: readonly PaletteSection[] = [
  ...defaultPalette.filter((s) => s.blockType !== "input"),
  {
    name: "Company presets",
    blockType: "section",
    variants: [
      {
        id: "help_footer",
        label: "help footer",
        factory: () => ({
          type: "section",
          text: { type: "mrkdwn", text: "Need help? Reach out in <#C0HELP>." },
        }),
      },
    ],
  },
];

<BlockKitBuilder palette={PALETTE} {...rest} />;
```

Variant `id`s must be unique across the array — the drag-drop lookup keys by id.

## Boundary

The package is deliberately decoupled from any Slack SDK or backend. It does not import HTTP clients, OAuth libraries, or workspace-state systems. Everything I/O-shaped is brokered through props.

Helpers also exported:

```ts
import {
  toSlackBlocks,           // strips builder-only fields (e.g. header `level`) before sending
  encodeBlocksToString,    // base64url-encode a blocks array (for URL state)
  decodeBlocksFromString,
  defaultPalette,          // the built-in palette — spread to customize
} from "@tightknitai/block-kit-builder";

import type {
  SupportedBlock,
  SupportedBlockType,
  BlockKitBuilderProps,
  PaletteSection,
  PaletteVariant,
  SendPayload,
  SendResult,
  ChannelOption,
  SendAsUserStatus,
  PreviewHooks,
} from "@tightknitai/block-kit-builder";
```

## Backend

The builder is frontend-only. For a full app that handles OAuth, channel listing, and `chat.postMessage`, see [block-kit-builder-template](https://github.com/TightknitAI/block-kit-builder-template) — a Vite + React SPA on Cloudflare Workers that wires this package to [slack-hono](https://github.com/TightknitAI/slack-hono) on the backend.

## Validation

Defense-in-depth: blocks are validated against [slack-block-kit-validator](https://github.com/TightknitAI/slack-block-kit-validator) before send. Issues are surfaced in the issues sheet with line numbers — users can fix them inline before posting.

## Styling

Ships a compiled stylesheet at `@tightknitai/block-kit-builder/styles.css`. The styles use CSS custom properties (`--background`, `--primary`, `--border`, etc.) for theming. Consumers must provide values for these vars — the standard shadcn/ui token set works as-is.

```ts
import "@tightknitai/block-kit-builder/styles.css";
```

### Branding (typed `theme` prop)

For consumers who don't already have a shadcn token set on `:root`, the `theme` prop is a typed shortcut that writes a subset of tokens directly:

```tsx
import type { BrandTheme } from "@tightknitai/block-kit-builder";

const brand: BrandTheme = {
  tokens: { primary: "262 83% 58%", radius: "0.75rem" },
  dark:   { primary: "263 70% 75%" }
};

<BlockKitBuilder theme={brand} {...rest} />
```

- `tokens` applies in both light and dark contexts.
- `light` and `dark` override per mode; the dark variant kicks in under a standard `.dark` ancestor class (next-themes default).
- Color tokens take HSL component strings (`"262 83% 58%"`), matching the underlying CSS variable contract; `radius` takes a CSS length.
- Scope is the builder chrome only. The embedded Slack preview keeps its native Slack styling regardless of `theme`; use `defaultPreviewTheme` for the preview's light/dark toggle.

The lower-level CSS-variable contract above keeps working; the `theme` prop simply layers on top of it.

### Typography

Fonts are deliberately not part of `BrandTheme`. The builder sets no `font-family` of its own (aside from `font-mono` on the JSON viewer, which is intentional), so it inherits whatever the host page declares on `<html>` or `<body>`. Set your brand typography globally and the builder will pick it up automatically — no additional configuration needed. The Slack preview surface continues to render with Slack's own typography via `slack-blocks-to-jsx`.

## License

MIT. See [LICENSE](./LICENSE).

---

Maintained by the [Tightknit](https://tightknit.ai) team.
