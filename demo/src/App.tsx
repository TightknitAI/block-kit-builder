import {
  BlockKitBuilder,
  type ChannelOption,
  type SendAsUserStatus,
  type SendPayload,
  type SendResult,
  type SupportedBlock
} from '@tightknitai/block-kit-builder';
import { useState } from 'react';

const MOCK_CHANNELS: ChannelOption[] = [
  { id: 'C0001', name: 'general' },
  { id: 'C0002', name: 'random' },
  { id: 'C0003', name: 'engineering' },
  { id: 'C0004', name: 'design' },
  { id: 'C0005', name: 'product' }
];

const INITIAL_BLOCKS: SupportedBlock[] = [
  {
    type: 'header',
    text: { type: 'plain_text', text: 'Welcome to the Block Kit Builder demo' }
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Drag blocks from the palette on the left, edit them inline, then click *Send* to see the mock send dialog.'
    }
  },
  { type: 'divider' }
];

async function loadChannels(): Promise<ChannelOption[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_CHANNELS;
}

async function loadSendAsUserStatus(): Promise<SendAsUserStatus> {
  await new Promise((r) => setTimeout(r, 150));
  return { canSendAsUser: true };
}

async function onSend(payload: SendPayload): Promise<SendResult> {
  await new Promise((r) => setTimeout(r, 400));
  console.log('[demo] onSend called with', payload);
  const channel = MOCK_CHANNELS.find((c) => c.id === payload.channelId);
  window.alert(
    `Mock send to #${channel?.name ?? payload.channelId}\n` +
      `${payload.blocks.length} block${payload.blocks.length === 1 ? '' : 's'} — ` +
      `sendAsUser=${payload.sendAsUser}\n\nSee console for full payload.`
  );
  return { ok: true };
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className={theme === 'dark' ? 'dark' : ''} style={{ height: '100%' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>@tightknitai/block-kit-builder — local demo</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Library imported from <code>../src/index.ts</code> — edits to library source hot-reload here.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              cursor: 'pointer'
            }}
          >
            Demo page theme: {theme}
          </button>
        </header>
        <div style={{ flex: 1, minHeight: 0 }}>
          <BlockKitBuilder
            workspaceName="Acme Inc."
            initialBlocks={INITIAL_BLOCKS}
            loadChannels={loadChannels}
            loadSendAsUserStatus={loadSendAsUserStatus}
            onSend={onSend}
            defaultPreviewTheme={theme}
          />
        </div>
      </div>
    </div>
  );
}
