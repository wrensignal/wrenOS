# WrenOS

WrenOS is the open-source **control plane** for operator-managed crypto agent systems.

This repository provides the WrenOS CLI, profiles, packs, adapters, loop primitives, and inspectable file-based configuration that power evidence-based workflows:

**discover → score → validate → execute (paper-first)**

It is designed for operators who want explicit control and auditability, not black-box automation.

- **Who it is for:** solo operators, small teams, and infra-minded builders running agent workflows.
- **What works today:** bootstrap/config flows, safety checks, profile/pack setup, inference/execution connectivity tests, and CLI-driven inspectable runtime config.
- **Hosted default vs self-host override:** works with hosted-default services (for example Speakeasy inference routing), and can run with self-host overrides by replacing endpoints/config.
- **Safety guarantees:** `liveExecution: false` by default, explicit approvals, confidence-tier fallback behavior, and inspectable JSON/Markdown artifacts.
- **Beta surface:** one-command orchestration loop is available as `wrenos start` (beta).

> This project was previously known as **0xClaw**. See `docs/migrating-from-0xclaw-to-wrenos.md` for migration details.
> Legacy `0xclaw` CLI + `.0xclaw` config compatibility is supported during the migration window (planned removal: **v0.3.0**).

## Repository maturity

### Available today
- `wrenos` CLI lifecycle: `init`, `doctor`, `status`, `config`, `wallet setup`, `test inference`, `test execution`, `init-pack`, `bootstrap-wrenos`, `migrate`
- deterministic one-command demo: `npm run example:paper`
- Inspectable file-based config and generated artifacts under `.wrenos/`
- Evidence-first paper workflow example (`examples/wrenos-paper-happy-path`)
- CI-ready verification path (`npm run verify` + GitHub Actions CI)

### Experimental
- `wrenos start` beta orchestration loop (structured heartbeat logging, paper-safe default, explicit approval posture)
- Turnkey Telegram/operator UX conventions and some pack ergonomics
- Rapidly evolving adapter integration surface for multi-venue execution workflows

### Planned
- Broader deployment automation and managed observability bundles

## WrenOS pipeline (evidence-first)

WrenOS is built around a technical loop:

1. **discover** market/research inputs
2. **score** candidates with explicit signals
3. **validate** via gating and safety constraints
4. **execute** in paper mode first (live only by explicit approval)

Every stage is inspectable through config and generated artifacts.

## Clone and install

```bash
git clone https://github.com/wrensignal/wrenOS.git
cd wrenOS
npm install
```

## Quick start

```bash
wrenos init --profile research-agent
wrenos doctor
wrenos status
```

## End-to-end happy path (paper-first)

Concrete flow: discovery input → validation/gating → paper decision → audit log

```bash
npm run example:paper
cat examples/wrenos-paper-happy-path/out/paper-decision-log.json
```

## CLI highlights

```bash
wrenos init --profile research-agent
wrenos config set inference.baseUrl https://api.speakeasyrelay.com
wrenos wallet setup
wrenos init-pack --pack meme-discovery
wrenos test inference
wrenos test execution
wrenos start --once
wrenos bootstrap-wrenos
```

Legacy alias support (temporary):
- `0xclaw ...` still works
- `.0xclaw/config.json` is read if `.wrenos/config.json` is absent

Migration command for existing operators:
```bash
wrenos migrate
# or, to overwrite existing .wrenos files:
wrenos migrate --force
```

## Safety posture

- **Execution begins in paper mode by default.**
- **Live execution requires explicit enablement.**
- **External side effects require approvals.**
- Confidence tiers degrade behavior when data quality weakens (up to hold/observe mode).
- Operator overrides are visible in inspectable config files.
- JSON/Markdown artifacts preserve auditability across decision stages.

## Package map

- `packages/cli` — **WrenOS CLI control surface** for bootstrap, config, safety checks, migration, and template generation.  
  **Maturity:** stable

- `packages/core` — shared policy defaults and fallback semantics used across the control plane.  
  **Maturity:** stable

- `packages/profiles` — starter profile templates that define operator intent and risk posture.  
  **Maturity:** stable

- `packages/loops` — heartbeat/scorecard primitives for validation-aware loop behavior.  
  **Maturity:** stable (evolving logic surface)

- `packages/adapters` — WrenOS-compatible adapters for inference, execution, and operator interfaces.  
  **Maturity:** active/evolving integration surface

- `packages/speakeasy-ai` — OpenAI-compatible Speakeasy client with built-in x402 flow.  
  **Maturity:** stable (kept as separate package identity for compatibility)

## Scripts

```bash
npm run build
npm run lint
npm run typecheck
npm run test
npm run smoke:cli
npm run verify
```

## Docs

- `docs/quickstart.md`
- `docs/runtime-status.md`
- `docs/safety.md`
- `docs/speakeasy-integration.md`
- `docs/migrating-from-0xclaw-to-wrenos.md` (canonical migration guide)
- `docs/migration-0xclaw-to-wrenos.md` (legacy pointer)
- `CHANGELOG.md`

## Landing page prototype

A first-pass marketing site is available at:

- `site/index.html`

Open it locally in your browser to preview.

## License

Apache-2.0
