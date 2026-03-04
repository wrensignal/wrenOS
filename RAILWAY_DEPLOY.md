# 0xClaw One-Click Railway Deploy

This guide covers template-based deploy for a full 0xClaw agent stack.

## Template
- `railway.json` in repo root defines the deploy template.
- Intended deploy URL after publishing template: `https://railway.com/deploy/0xclaw`

## Required Environment Variables

### Core
- `PROFILE` (default: `research-agent`)
  - Valid examples: `research-agent`, `research-only`, `solo-trader-paper`, `trading-agent-paper`, `trading-agent-live-disabled`
- `SPEAKEASY_BASE_URL` (default: `https://api.speakeasyrelay.com`)
- `OPENCLAW_API_KEY` (sensitive)
- `TELEGRAM_BOT_TOKEN` (required for Telegram chat UX)
- `TELEGRAM_CHAT_ALLOWLIST` (optional comma-separated chat IDs)

### Optional / conditional
- `SPEAKEASY_API_KEY` (optional)
- `AGENT_WALLET_PRIVATE_KEY` (sensitive; required for execution-enabled profiles)

## Deploy Steps
1. Open Railway template deploy URL (after publish):
   - `https://railway.com/deploy/0xclaw`
2. Select project/account.
3. Confirm env vars:
   - keep `SPEAKEASY_BASE_URL=https://api.speakeasyrelay.com`
   - choose `PROFILE`
   - set required secrets
4. Deploy.

## Post-Deploy Verification

### 1) Service health
- Confirm Railway service is up and restart-stable.
- Check logs for startup errors.

### 2) Inference connectivity
- Verify requests target `SPEAKEASY_BASE_URL`.
- Confirm successful response from `/health` and model route usage.

### 3) Agent config sanity
- Confirm selected `PROFILE` is loaded.
- Confirm `liveExecution=false` unless explicitly intended.

### 4) Heartbeat loop
- Confirm heartbeat loop starts and writes expected artifacts/logs.
- Confirm no crash loop under normal cadence.

### 5) Execution path (if enabled)
- Verify wallet env is present.
- Run a dry execution path (quote-level / paper mode).
- Confirm Jupiter referral account is attached via config defaults/overrides.

### 6) Telegram chat UX (2-minute path)
- Set `TELEGRAM_BOT_TOKEN` in Railway.
- Connect OpenClaw Telegram routing for this agent.
- Verify command responses:
  - `/status`
  - `/watchlist`
  - `/health`
  - `/trade <symbol>`
  - `/paper on|off`

## Troubleshooting
- Missing config error: ensure profile exists and env vars are set.
- Inference errors: verify `SPEAKEASY_BASE_URL` and network egress.
- Wallet errors: confirm `AGENT_WALLET_PRIVATE_KEY` format and chain compatibility.
- Rate limit behavior: inspect logs and retry/backoff settings in runtime config.

## Operator Notes
- Defaults are optimized for fast start and safety.
- Operators can override inference and execution settings via CLI/config after deploy.
