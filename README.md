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
