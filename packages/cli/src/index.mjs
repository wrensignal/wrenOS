#!/usr/bin/env node
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const configDir = path.join(cwd, '.0xclaw');
const configPath = path.join(configDir, 'config.json');

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return fallback;
  return process.argv[idx + 1];
}

async function cmdInit() {
  const profile = arg('--profile', 'research-only');
  await mkdir(configDir, { recursive: true });
  const profilePath = path.resolve(cwd, `packages/profiles/templates/${profile}.json`);
  let body;
  try {
    body = JSON.parse(await readFile(profilePath, 'utf8'));
  } catch {
    body = { profile, liveExecution: false, loop: { heartbeatAdaptive: true } };
  }
  await writeFile(configPath, JSON.stringify({ ...body, createdAt: new Date().toISOString() }, null, 2));
  console.log(`Initialized 0xclaw in ${configDir} with profile=${profile}`);
}

async function cmdDoctor() {
  const checks = [];
  checks.push({ name: 'node', ok: Number(process.versions.node.split('.')[0]) >= 20 });
  checks.push({ name: 'config', ok: existsSync(configPath) });
  try {
    await access(path.join(cwd, 'packages'));
    checks.push({ name: 'packages-dir', ok: true });
  } catch {
    checks.push({ name: 'packages-dir', ok: false });
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(JSON.stringify({ ok: failed.length === 0, checks }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

async function cmdStatus() {
  const cfg = existsSync(configPath) ? JSON.parse(await readFile(configPath, 'utf8')) : null;
  console.log(JSON.stringify({
    ready: Boolean(cfg),
    configPath,
    profile: cfg?.profile || null,
    liveExecution: cfg?.liveExecution ?? null,
    heartbeatAdaptive: cfg?.loop?.heartbeatAdaptive ?? null
  }, null, 2));
}

async function cmdStart() {
  console.log('0xclaw start: orchestration hook placeholder (wire to OpenClaw cron/heartbeat runner)');
}

const AGENTS_MD = `# AGENTS.md — OpenClaw Agent Configuration Template
# Copy this file to .0xclaw/AGENTS.md and customise for your deployment.

## Agent Identity
name: my-openclaw-agent
description: Research-grade crypto signal agent (no live execution)

## Safety Posture (safe-by-default — do not change liveExecution without review)
liveExecution: false          # Set true only after paper-trading validation
requireExplicitApproval: true # Each live order requires operator sign-off

## Data Sources (ordered by preference; unavailable sources are skipped)
dataSources:
  - walletFlow      # On-chain wallet movement — primary signal
  - birdeye         # DEX price/volume aggregator — primary enrichment
  - lunar           # Social sentiment — primary enrichment
  - dexscreener     # Fallback A: enriched DEX data
  - agentiLiteFallback  # Fallback B: geckoterminal + social + market + wallet

## Confidence Tiers & Fallback Behaviour
# Tier 0 — all primary sources healthy: full basket, normal sizing
# Tier 1 — ≥2 sources healthy: reweight, reduce position sizes
# Tier 2 — wallet only: safe mode, minimal exposure
# Tier 3 — no reliable data: hold/observe, no new positions
confidenceTierPolicy:
  tier0: { action: normal,     maxNewPositions: 8 }
  tier1: { action: reweight,   maxNewPositions: 4 }
  tier2: { action: safe_mode,  maxNewPositions: 1 }
  tier3: { action: hold_observe, maxNewPositions: 0 }

## Symbol Selection
minNewSymbolRatio: 0.35       # At least 35% of basket must be fresh symbols
maxSymbolStalenessCycles: 6   # Drop symbol after 6 cycles without signal
targetBasketSize: 8

## Risk Limits (paper/live)
# Uncomment and tune only when profile is solo-trader-paper or above
# maxTradeUsd: 25
# maxDailyNotionalUsd: 75
`;

const HEARTBEAT_MD = `# HEARTBEAT.md — OpenClaw Heartbeat Loop Template
# Copy this file to .0xclaw/HEARTBEAT.md and customise for your deployment.

## Loop Configuration
heartbeatAdaptive: true   # Allow loop cadence to self-tune based on data quality
cycleIntervalSeconds: 300 # Base heartbeat: every 5 minutes (adaptive may shorten/lengthen)

## Lanes
# exploit — trade signals with established edge evidence
# explore — evaluate new symbols for potential promotion to exploit
lanes:
  exploit:
    enabled: true
    minEdgeBps: 15          # Minimum edge in basis points to act
    maxPoolsPerCycle: 5
  explore:
    enabled: true
    maxPoolsPerCycle: 10
    promoteAfterCycles: 3   # Cycles before an explore pool can be promoted

## Adaptive Tuner
tuner:
  enabled: true
  targetSharpe: 1.5         # Increase cycle frequency when Sharpe < target
  cooldownCycles: 2         # Minimum cycles between parameter adjustments
  maxCadenceMultiplier: 3   # Never slow heartbeat more than 3x base interval

## Fallback on Data Degradation
fallback:
  tier1Action: reweight_lanes      # Scale back exploit, keep explore alive
  tier2Action: pause_exploit        # Suspend exploit lane entirely
  tier3Action: hold_all             # Pause all execution, log and alert only
  alertWebhook: ""                  # Optional: POST alert JSON to this URL

## Regression Guard
regression:
  enabled: true
  worstDrawdownPctLimit: 15   # Halt loop if drawdown exceeds 15%
  lookbackCycles: 24          # Window for drawdown calculation
`;

const TEMPLATES_README = `# OpenClaw Operator Templates

These are starter templates generated by \`bootstrap-openclaw\`.
They live in \`.0xclaw/openclaw-templates/\` and are **not** active until you copy them.

## Files

| File | Purpose |
|------|---------|
| AGENTS.md | Agent identity, data sources, confidence tiers, risk limits |
| HEARTBEAT.md | Heartbeat loop cadence, lanes, adaptive tuner, regression guard |

## How to use

1. Review each template and adjust values for your deployment.
2. Copy to the active config directory:
   \`\`\`bash
   cp .0xclaw/openclaw-templates/AGENTS.md .0xclaw/AGENTS.md
   cp .0xclaw/openclaw-templates/HEARTBEAT.md .0xclaw/HEARTBEAT.md
   \`\`\`
3. Run \`node packages/cli/src/index.mjs status\` to confirm the core config is healthy.

## Safety defaults

- \`liveExecution: false\` in every template — never flipped automatically.
- Confidence-tier fallbacks are mandatory; tier 3 always means hold/observe.
- See \`docs/safety.md\` for the full safety posture.
`;

async function cmdBootstrapOpenclaw() {
  const templatesDir = path.join(configDir, 'openclaw-templates');
  await mkdir(templatesDir, { recursive: true });

  const files = [
    { name: 'AGENTS.md', content: AGENTS_MD },
    { name: 'HEARTBEAT.md', content: HEARTBEAT_MD },
    { name: 'README.md', content: TEMPLATES_README },
  ];

  for (const { name, content } of files) {
    const dest = path.join(templatesDir, name);
    if (!existsSync(dest)) {
      await writeFile(dest, content);
      console.log(`  created  ${path.relative(cwd, dest)}`);
    } else {
      console.log(`  exists   ${path.relative(cwd, dest)} (skipped)`);
    }
  }
  console.log(`\nbootstrap-openclaw complete. Templates in ${path.relative(cwd, templatesDir)}/`);
  console.log('Next: review templates, then copy to .0xclaw/ when ready (see README.md inside).');
}

async function main() {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'init': return cmdInit();
    case 'doctor': return cmdDoctor();
    case 'status': return cmdStatus();
    case 'start': return cmdStart();
    case 'bootstrap-openclaw': return cmdBootstrapOpenclaw();
    default:
      console.log('Usage: 0xclaw <init|doctor|status|start|bootstrap-openclaw> [--profile research-only]');
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
