import {
  BlockKitchen,
  type ChannelOption,
  defaultTemplates,
  type SendAsUserStatus,
  type SendPayload,
  type SendResult,
  type SupportedBlock,
  type Template,
  TemplatePicker
} from '@tightknitai/block-kitchen';
import { useEffect, useState } from 'react';

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
      text: 'Pick a template on the right to load it here, or drag blocks from the palette to start from scratch.'
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

  // Mirror `theme` onto <html> so the .dark CSS-variable rule reaches
  // Radix portals (sheets, dialogs, popovers, tooltips). They mount
  // under <body>, so a wrapper-div .dark would never cascade to them.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => root.classList.remove('dark');
  }, [theme]);

  // Lifted draft blocks. The builder reads them on mount; updating this
  // state alone won't refresh an already-mounted builder, so we pair it
  // with `builderKey` below.
  const [blocks, setBlocks] = useState<SupportedBlock[]>(INITIAL_BLOCKS);
  // Bumped on every template selection so React unmounts and re-mounts
  // <BlockKitchen>, causing it to re-read `initialBlocks={blocks}`.
  // (`initialBlocks` is intentionally a mount-time prop; this `key`
  // pattern is the supported way to programmatically reset the draft.)
  const [builderKey, setBuilderKey] = useState(0);

  const handleSelectTemplate = (template: Template) => {
    setBlocks(template.blocks);
    setBuilderKey((n) => n + 1);
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: 6, flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>block-kitchen — live demo</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Drag blocks from the palette, edit them in place, and send to a (mocked) Slack channel.{' '}
                <a
                  href="https://github.com/TightknitAI/block-kitchen"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  GitHub
                </a>
                {' · '}
                <a
                  href="https://www.npmjs.com/package/@tightknitai/block-kitchen"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  npm
                </a>
              </div>
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
        <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <BlockKitchen
              key={builderKey}
              workspaceName="Acme Inc."
              initialBlocks={blocks}
              onChange={setBlocks}
              loadChannels={loadChannels}
              loadSendAsUserStatus={loadSendAsUserStatus}
              onSend={onSend}
              defaultPreviewTheme={theme}
              allowedSurfaces={['message', 'modal', 'app_home']}
            />
          </div>
          <aside
            className="bk-root"
            style={{
              width: 380,
              flexShrink: 0,
              borderRadius: 6,
              border: '1px solid hsl(var(--border))',
              overflow: 'hidden'
            }}
          >
            <TemplatePicker
              templates={defaultTemplates}
              heading="Templates"
              theme={theme}
              onSelect={handleSelectTemplate}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
