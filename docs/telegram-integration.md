# Telegram Integration (Phase 2B)

0xClaw uses OpenClaw's built-in Telegram channel support. This gives operators a fast chat UX after deploy.

## Commands
- `/status`
- `/watchlist`
- `/health`
- `/trade <symbol>`
- `/paper on|off`

## Adapter
- Module: `packages/adapters/src/telegram.mjs`
- Export: `createTelegramAdapter(config, hooks)`
- The adapter parses command text and returns structured responses.

## Hook contract
You can wire adapter output to your runtime by passing hooks:
- `getStatus(state)`
- `getWatchlist(state)`
- `getHealth(state)`
- `proposeTrade({ symbol, paperMode })`
- `onPaperModeChange(enabled)`
- `defaultChat({ text, state, commandLike })` (free-form Telegram message passthrough)

## Minimal usage
```javascript
import { createTelegramAdapter } from '@0xclaw/adapters/src/index.mjs';

const tg = createTelegramAdapter({
  profile: 'trading-agent-paper',
  inferenceBaseUrl: process.env.SPEAKEASY_BASE_URL
}, {
  getStatus: async () => ({ ok: true, profile: 'trading-agent-paper' }),
  getWatchlist: async () => ({ ok: true, watchlist: ['BONK', 'WIF'] }),
  defaultChat: async ({ text }) => ({
    ok: true,
    message: `Agent reply: ${text}`
  })
});

const res = await tg.handleText('/status');
const chat = await tg.handleText('what changed in the market today?');
```

## Railway env
Required for chat UX:
- `TELEGRAM_BOT_TOKEN`

Optional:
- `TELEGRAM_CHAT_ALLOWLIST` (comma-separated chat IDs)

## Notes
- `/trade` should propose by default unless live mode is explicitly approved.
- Keep paper mode default ON for safety.
