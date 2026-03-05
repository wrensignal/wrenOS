---
name: speakeasy
description: Private inference routing and operations via Speakeasy endpoints. Use when configuring model routing, running private inference calls, validating degraded-mode behavior, setting cost/usage logging, or integrating agents with Speakeasy-backed inference in OpenClaw workflows.
---

# Speakeasy Skill

Install target:

```bash
openclaw skills install speakeasy
```

This skill defines the Speakeasy tool contract for operator-facing usage:
- `speakeasy_chat`
- `speakeasy_models`
- `speakeasy_balance`

On first use, the runtime should ensure a hot wallet exists (generate if absent), then reuse it for subsequent paid-path calls.

## Configure

1. Require local env vars (never commit secrets):
   - `SPEAKEASY_BASE_URL` (default `https://speakeasy.ing`)
   - `AGENT_WALLET_PRIVATE_KEY` (or runtime-managed first-use wallet)
2. Route by task type:
   - `research`
   - `deep_think`
   - `codegen`
3. Keep fallback chains explicit per task.

## Tool Contract

### `speakeasy_chat`
OpenAI-compatible chat-completions call through Speakeasy with x402 handled automatically.

Input shape:
- `model: string`
- `messages: Array<{ role: 'system'|'user'|'assistant', content: string }>`
- `stream?: boolean`
- `max_tokens?`, `temperature?` (optional pass-through)

Behavior:
1. Ensure wallet exists (generate if missing).
2. Send chat request.
3. If 402, sign challenge + replay.
4. Return JSON response (or stream iterator payloads).

### `speakeasy_models`
Lists available models from Speakeasy endpoint.

Behavior:
- Returns provider model list and route metadata when available.

### `speakeasy_balance`
Returns wallet/payment budget status for current runtime wallet.

Behavior:
- Uses active wallet context.
- Surfaces spendable balance and/or payment readiness indicators.

## Operate

1. Gate expensive calls on material input change.
2. Cache deterministic calls (short TTL) to reduce duplicate spend.
3. Log usage/cost per call to local memory artifacts.
4. On route degradation:
   - downgrade cadence,
   - keep paper mode,
   - emit explicit degraded status,
   - avoid silent failure.

## Verify

1. Run preflight probe for each task route.
2. Confirm non-empty responses and model identity.
3. Confirm usage logging updated.
4. Confirm fallback route works when primary fails.
5. Validate tool surfaces:
   - `speakeasy_models` returns model list
   - `speakeasy_balance` returns non-error status
   - `speakeasy_chat` returns response/stream

## References

- Read `references/env-and-routing.md` for env schema and routing contract.
- Read `references/degraded-mode.md` for confidence-tier behavior and fallback ladder.
- Read `references/ops-checklist.md` for runbook-style verification.
- Skill logo asset: `assets/speakeasy-logo.svg`.
