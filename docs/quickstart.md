# Quickstart

This guide gives you a smooth first run for WrenOS, even while some orchestration features are still evolving.

## Recommended operator path (canonical onboarding)

1. Install dependencies
2. Run system diagnostics (`doctor`)
3. Initialize a profile
4. Inspect system snapshot (`status`)
5. Generate and review templates
6. Run the paper happy-path example
7. Verify paper-mode safety posture
8. Optionally connect integrations

---

## Option A — one-command installer (recommended)

```bash
bash scripts/install.sh
```

The installer is idempotent and covers install + baseline diagnostics.

---

## Option B — manual setup

### 1) Install
```bash
npm install
```

### 2) Doctor
```bash
wrenos doctor
```

### 3) Init
```bash
wrenos init --profile research-agent
```

### 4) Status
```bash
wrenos status
```

### 5) Templates
```bash
wrenos bootstrap-wrenos
cp .wrenos/wrenos-templates/AGENTS.md .wrenos/AGENTS.md
cp .wrenos/wrenos-templates/HEARTBEAT.md .wrenos/HEARTBEAT.md
```

### 6) Safe defaults (read this before proceeding)

- Execution begins in paper mode by default (`liveExecution: false`).
- Live execution requires explicit enablement.
- External side effects require approvals.
- Confidence-tier fallbacks should degrade safely under weak data.

See `docs/safety.md` for full policy guidance.

### 7) Next steps

Run the deterministic paper happy-path flow:

```bash
npm run example:paper
cat examples/wrenos-paper-happy-path/out/paper-decision-log.json
```

Optional integrations after baseline validation:

```bash
wrenos test inference
wrenos test execution
wrenos wallet setup
wrenos init-pack --pack dual-agent-pack
```

---

## Profiles

| Profile | Live execution | Trade mode |
|---------|---------------|------------|
| `research-agent` | off | none |
| `solo-trader-paper` | off | paper |

Switch profiles any time:

```bash
wrenos init --profile solo-trader-paper
```

---

## Orchestration expectations and current limits

WrenOS already supports inspectable setup, diagnostics, profile/pack config, and paper-first example flow.

What is **not yet shipped**:
- `wrenos start` long-running orchestration command

Current expectation:
- Use your existing scheduler/heartbeat process (cron, supervisor, or platform runtime) for long-running loops.

---

## Migration note

If you're coming from `0xClaw`:
- use `wrenos` as the primary CLI name
- `0xclaw` remains as temporary compatibility alias
- `.wrenos/` is the primary config directory (`.0xclaw/` fallback supported during migration)
- run `wrenos migrate` (or `wrenos migrate --force`) to move legacy config

See:
- `docs/migrating-from-0xclaw-to-wrenos.md`
- `docs/migration-0xclaw-to-wrenos.md`

For hosted/private inference routing details, see `docs/speakeasy-integration.md`.
