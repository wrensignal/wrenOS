# 0xClaw

0xClaw is a **crypto agent compatibility kit for OpenClaw**.

Pick a profile, deploy fast, and get a working agent stack with safe defaults.

## Product model (open + hosted)

- **Open source (this repo):** CLI, profiles, adapters, loops, packs, examples
- **Hosted default path:** pre-wired to Speakeasy inference + execution routing defaults

You can fully self-host and override defaults. The hosted/recommended path is optimized for speed, reliability, and better out-of-box economics.

## Default architecture

- Inference default: `https://api.speakeasyrelay.com`
- Model routing defaults:
  - `research` → `deepseek-v3.2`
  - `deep_think` → `qwen3-235b-a22b-thinking-2507`
  - `codegen` → `qwen3-coder-480b-a35b-instruct`
  - `uncensored` → `venice-uncensored`
- Execution venues:
  - Jupiter (referral-capable)
  - pump.fun (direct bonding-curve path)

## Quick start

### Option A — one-command local install

```bash
bash scripts/install.sh
```

### Option B — manual local setup

```bash
npm install
node packages/cli/src/index.mjs init --profile research-agent
node packages/cli/src/index.mjs doctor
node packages/cli/src/index.mjs status
```

After `init`, a workspace-root `.mcp.json` is generated (if missing) with:
- `agenti-lite`
- `pump-fun-sdk-lite`
- `helius` (placeholder API key)

For Helius, create a free key at `https://dashboard.helius.dev` (no credit card), then set `HELIUS_API_KEY` in `.mcp.json`.

## `speakeasy-ai` SDK (x402 handled internally)

```bash
npm install speakeasy-ai
```

```javascript
import { SpeakeasyClient } from 'speakeasy-ai';

const client = new SpeakeasyClient({
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  // defaults to https://speakeasy.ing
});

const response = await client.chat.completions.create({
  model: 'deepseek-v3.2',
  messages: [{ role: 'user', content: 'Analyze this token...' }],
  stream: true,
});
```

`speakeasy-ai` handles x402 flow internally: request → 402 challenge → EIP-3009 signature → replay → response stream.

## CLI highlights

```bash
# initialize profile
0xclaw init --profile research-agent

# set config overrides
0xclaw config set inference.baseUrl https://my-inference.example.com
0xclaw config set execution.venues.jupiter.referralAccount <pubkey>

# wallet setup (generated or import)
0xclaw wallet setup
0xclaw wallet setup --private-key 0x...

# connectivity checks
0xclaw test inference
0xclaw test execution
```

## One-click deploy (Railway)

- Template config: `railway.json`
- Deploy guide: `RAILWAY_DEPLOY.md`
- Target flow: deploy → set env vars → connect Telegram → chat with agent in minutes

## Telegram operator UX

Supported commands:
- `/status`
- `/watchlist`
- `/health`
- `/trade <symbol>`
- `/paper on|off`

See `docs/telegram-integration.md`.

## Package map

- `packages/core` — schemas, safety policy defaults, shared utilities
- `packages/adapters` — inference/execution/telegram adapters + data-quality logic
- `packages/loops` — heartbeat, regression, adaptive controller primitives
- `packages/cli` — operator commands (`init`, `doctor`, `config`, `wallet`, `test`, etc.)
- `packages/profiles` — starter OpenClaw profile templates
- Vendored MCP servers: `agenti-lite`, `pump-fun-sdk-lite`, `helius` (via `.mcp.json` template)

## Safety posture

- Live execution disabled by default
- Explicit approvals required for external side effects
- Data-quality confidence tiers and fallback paths are mandatory
- Paper mode is the default operating mode

## License

Apache-2.0 (see `LICENSE`).
