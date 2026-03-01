# Quickstart

## Option A — One-command installer (recommended for fresh operators)

```bash
bash scripts/install.sh
```

This script:
1. Verifies Node.js >= 20 is present
2. Runs `npm install`
3. Runs `doctor` to validate the environment
4. Runs `init --profile research-only` (skipped if already initialised)
5. Prints next steps

The script is idempotent — safe to run more than once.

---

## Option B — Manual setup

### 1) Install
```bash
npm install
```

### 2) Validate environment
```bash
node packages/cli/src/index.mjs doctor
```

### 3) Initialize profile
```bash
node packages/cli/src/index.mjs init --profile research-only
```

### 4) Check status
```bash
node packages/cli/src/index.mjs status
```

---

## Generating OpenClaw operator templates

After initialising, scaffold starter `AGENTS.md` and `HEARTBEAT.md` templates:

```bash
node packages/cli/src/index.mjs bootstrap-openclaw
```

This creates `.0xclaw/openclaw-templates/` containing:

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent identity, data sources, confidence tiers, risk limits |
| `HEARTBEAT.md` | Heartbeat loop cadence, lanes, adaptive tuner, regression guard |
| `README.md` | Instructions for copying and activating the templates |

Templates are **not** active until you copy them into `.0xclaw/`:

```bash
cp .0xclaw/openclaw-templates/AGENTS.md .0xclaw/AGENTS.md
cp .0xclaw/openclaw-templates/HEARTBEAT.md .0xclaw/HEARTBEAT.md
```

All templates default to `liveExecution: false`. See `docs/safety.md` before enabling live execution.

---

## Profiles

| Profile | Live execution | Trade mode |
|---------|---------------|------------|
| `research-only` | off | none |
| `solo-trader-paper` | off | paper |

Switch profiles at any time by re-running `init`:

```bash
node packages/cli/src/index.mjs init --profile solo-trader-paper
```
