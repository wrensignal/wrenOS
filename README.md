# 0xclaw (private alpha)

`0xclaw` is a crypto compatibility kit for OpenClaw operators.

## Goals
- Safe-by-default crypto agent setup
- Unified data + inference adapters
- Heartbeat-ready strategy loop primitives
- One-command operator UX

## Quick start (local)

```bash
npm install
node packages/cli/src/index.mjs doctor
node packages/cli/src/index.mjs init --profile research-only
node packages/cli/src/index.mjs status
```

## Package map
- `packages/core` — schemas, safety policy defaults, shared utilities
- `packages/adapters` — market/social/sentiment + inference adapters
- `packages/loops` — heartbeat, regression, adaptive controller primitives
- `packages/cli` — `init`, `doctor`, `start`, `status`
- `packages/profiles` — starter OpenClaw profile templates

## Safety posture
- Live execution disabled by default
- Explicit approvals required for external side effects
- Data-quality confidence tiers and fallback paths are mandatory

## Vendored dependencies
- `vendor/pump-fun-sdk-lite` (v1.28.0, MIT)
  - Included for pump.fun/Solana integration experiments in private alpha.
  - Local audit summary (2026-03-03):
    - root (`--omit=dev`): 4 high
    - `mcp-server` (`--omit=dev`): 3 high, 1 moderate, 1 low
    - `typescript` (`--omit=dev`): 1 moderate
  - Status: **allowed for dev/test only** until vulnerabilities are reduced.

- `vendor/crypto-news-lite` (desktop source snapshot)
  - Included for crypto-news ingestion + MCP serving experiments.
  - Local audit summary (2026-03-03):
    - `mcp` (`@nirholas/free-crypto-news-mcp@2.0.0`, `--omit=dev`): 2 high, 1 moderate, 1 low
    - `scripts/archive` (`free-crypto-news-archive@2.0.0`, `--omit=dev`): 0
  - Status: **allowed for dev/test only** until MCP dependency vulnerabilities are reduced.
