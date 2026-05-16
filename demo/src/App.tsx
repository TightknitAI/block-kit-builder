import {
  BlockKitchen,
  type ChannelOption,
  type SendAsUserStatus,
  type SendPayload,
  type SendResult,
  type SupportedBlock,
  type Template,
  TemplatePicker
} from '@tightknitai/block-kitchen';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useState
} from 'react';

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

const TEMPLATES: Template[] = [
  {
    id: 'approval-request',
    name: 'Approval request',
    description: 'Header + body + approve/reject actions.',
    category: 'Approvals',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Approval needed' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Sarah* requested time off from *Mar 12* to *Mar 18*.' }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Approve' },
            style: 'primary',
            value: 'approve'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Reject' },
            style: 'danger',
            value: 'reject'
          }
        ]
      }
    ]
  },
  {
    id: 'product-release',
    name: 'Product release',
    description: 'Announce a new release with a CTA.',
    category: 'Notifications',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'We just shipped v2.5' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'New: bulk edit, keyboard shortcuts, and a redesigned inbox.' }
      }
    ]
  },
  {
    id: 'daily-standup',
    name: 'Daily standup',
    description: 'Yesterday / Today / Blockers prompts.',
    category: 'Polls and surveys',
    surface: 'message',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Daily standup' } },
      { type: 'section', text: { type: 'mrkdwn', text: '*Yesterday:* ...' } },
      { type: 'section', text: { type: 'mrkdwn', text: '*Today:* ...' } },
      { type: 'section', text: { type: 'mrkdwn', text: '*Blockers:* ...' } }
    ]
  },
  {
    id: 'modal-confirm',
    name: 'Confirm delete',
    description: 'Modal confirmation before a destructive action.',
    category: 'Approvals',
    surface: 'modal',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Are you sure?' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'This action cannot be undone.' }
      }
    ]
  }
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

const ASIDE_MIN = 280;
const ASIDE_MAX = 640;
const ASIDE_DEFAULT = 380;

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

  const [asideWidth, setAsideWidth] = useState<number>(ASIDE_DEFAULT);

  const handleResizePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startW = asideWidth;
    const move = (ev: PointerEvent) => {
      const next = Math.min(ASIDE_MAX, Math.max(ASIDE_MIN, startW + (startX - ev.clientX)));
      setAsideWidth(next);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  const handleResizeKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setAsideWidth((w) => Math.min(ASIDE_MAX, w + 16));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setAsideWidth((w) => Math.max(ASIDE_MIN, w - 16));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setAsideWidth(ASIDE_MAX);
    } else if (e.key === 'End') {
      e.preventDefault();
      setAsideWidth(ASIDE_MIN);
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
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
              flex: `0 1 ${asideWidth}px`,
              minWidth: ASIDE_MIN,
              maxWidth: ASIDE_MAX,
              position: 'relative',
              borderRadius: 6,
              border: '1px solid hsl(var(--border))',
              overflow: 'hidden'
            }}
          >
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize templates panel"
              aria-valuemin={ASIDE_MIN}
              aria-valuemax={ASIDE_MAX}
              aria-valuenow={asideWidth}
              tabIndex={0}
              onPointerDown={handleResizePointerDown}
              onKeyDown={handleResizeKeyDown}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -3,
                width: 6,
                cursor: 'col-resize',
                zIndex: 1,
                touchAction: 'none'
              }}
            />
            <TemplatePicker
              templates={TEMPLATES}
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
