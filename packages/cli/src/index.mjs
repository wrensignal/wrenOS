#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import path from 'node:path';

const cwd = process.cwd();
const configDir = path.join(cwd, '.0xclaw');
const configPath = path.join(configDir, 'config.json');

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return fallback;
  return process.argv[idx + 1];
}

function parseValue(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  try { return JSON.parse(raw); } catch { return raw; }
}

function setByPath(obj, dotPath, value) {
  const keys = dotPath.split('.').filter(Boolean);
  if (!keys.length) return obj;
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

async function loadConfigOrFail() {
  if (!existsSync(configPath)) {
    console.error('Config not found. Run: 0xclaw init --profile research-agent');
    process.exit(1);
  }
  return JSON.parse(await readFile(configPath, 'utf8'));
}

async function saveConfig(cfg) {
  await mkdir(configDir, { recursive: true });
  await writeFile(configPath, JSON.stringify(cfg, null, 2));
}

async function cmdInit() {
  const profile = arg('--profile', 'research-agent');
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


async function cmdInitPack() {
  const pack = arg('--pack', 'dual-agent-pack');
  if (pack !== 'dual-agent-pack') {
    console.error(`Unknown pack: ${pack}`);
    process.exit(1);
  }
  await mkdir(configDir, { recursive: true });

  const load = async (name, fallback) => {
    const p = path.resolve(cwd, `packages/profiles/templates/${name}.json`);
    try { return JSON.parse(await readFile(p, 'utf8')); } catch { return fallback; }
  };

  const research = await load('research-agent', { profile: 'research-agent', liveExecution: false });
  const trading = await load('trading-agent-paper', { profile: 'trading-agent-paper', liveExecution: false });

  const packCfg = {
    pack: 'dual-agent-pack',
    createdAt: new Date().toISOString(),
    agents: {
      researchAgent: {
        name: arg('--research-name', 'research-agent'),
        config: research
      },
      tradingAgent: {
        name: arg('--trading-name', 'trading-agent'),
        config: trading
      }
    },
    handoff: {
      channel: 'inbox/research-*.json',
      format: 'json'
    }
  };

  await writeFile(path.join(configDir, 'pack-dual-agent.json'), JSON.stringify(packCfg, null, 2));
  console.log(`Initialized pack dual-agent-pack in ${configDir}`);
}

async function cmdDoctor() {
  const checks = [];
  checks.push({ name: 'node', ok: Number(process.versions.node.split('.')[0]) >= 20 });
  checks.push({ name: 'config', ok: existsSync(configPath) });
  checks.push({ name: 'cli-runtime', ok: true });

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

async function cmdConfig() {
  const sub = process.argv[3];
  if (sub !== 'set') {
    console.log('Usage: 0xclaw config set <dot.path> <value>');
    process.exit(1);
  }
  const key = process.argv[4];
  const raw = process.argv[5];
  if (!key || typeof raw === 'undefined') {
    console.log('Usage: 0xclaw config set <dot.path> <value>');
    process.exit(1);
  }
  const cfg = await loadConfigOrFail();
  const next = setByPath(cfg, key, parseValue(raw));
  await saveConfig(next);
  console.log(`Updated ${key} in ${configPath}`);
}

async function cmdWalletSetup() {
  const importPk = arg('--private-key', null);
  const walletPath = path.join(configDir, 'wallet.json');
  await mkdir(configDir, { recursive: true });

  const privateKey = importPk || `0x${randomBytes(32).toString('hex')}`;
  const pseudoPublic = createHash('sha256').update(privateKey).digest('hex').slice(0, 44);

  const wallet = {
    createdAt: new Date().toISOString(),
    source: importPk ? 'import' : 'generated',
    chain: arg('--chain', 'solana'),
    privateKey,
    publicKey: arg('--public-key', pseudoPublic),
    warning: 'Hot wallet generated by CLI. Replace with secure key management before live trading.'
  };

  await writeFile(walletPath, JSON.stringify(wallet, null, 2));
  console.log(`Wallet saved: ${walletPath}`);
  console.log(`Public key: ${wallet.publicKey}`);
}

async function cmdTestInference() {
  const cfg = existsSync(configPath) ? JSON.parse(await readFile(configPath, 'utf8')) : {};
  const baseUrl = cfg?.inference?.baseUrl || process.env.SPEAKEASY_BASE_URL || 'https://api.speakeasyrelay.com';

  const t0 = Date.now();
  const health = await fetch(`${baseUrl}/health`);
  const latencyMs = Date.now() - t0;
  const modelsResp = await fetch(`${baseUrl}/v1/models`);
  const modelsJson = modelsResp.ok ? await modelsResp.json() : { data: [] };

  console.log(JSON.stringify({
    ok: health.ok && modelsResp.ok,
    baseUrl,
    latencyMs,
    healthStatus: health.status,
    modelsStatus: modelsResp.status,
    models: (modelsJson.data || []).map((m) => m.id)
  }, null, 2));

  process.exit(health.ok && modelsResp.ok ? 0 : 1);
}

async function cmdTestExecution() {
  const cfg = existsSync(configPath) ? JSON.parse(await readFile(configPath, 'utf8')) : {};
  const j = cfg?.execution?.venues?.jupiter || {};
  const referral = j.referralAccount || process.env.JUPITER_REFERRAL_ACCOUNT || null;
  const platformFeeBps = j.platformFeeBps || 0;

  const url = new URL('https://lite-api.jup.ag/swap/v1/quote');
  url.searchParams.set('inputMint', 'So11111111111111111111111111111111111111112'); // SOL
  url.searchParams.set('outputMint', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
  url.searchParams.set('amount', '10000000'); // 0.01 SOL
  url.searchParams.set('slippageBps', '50');
  if (platformFeeBps > 0) url.searchParams.set('platformFeeBps', String(platformFeeBps));

  try {
    const t0 = Date.now();
    const res = await fetch(url.toString());
    const ms = Date.now() - t0;
    const body = await res.json().catch(() => ({}));

    console.log(JSON.stringify({
      ok: res.ok,
      latencyMs: ms,
      venue: 'jupiter',
      referralAccount: referral,
      platformFeeBps,
      quoteStatus: res.status,
      outAmount: body.outAmount || null,
      routePlanSteps: Array.isArray(body.routePlan) ? body.routePlan.length : 0,
      note: 'Referral account is applied during swap build/execution; quote confirms routing path availability.'
    }, null, 2));

    process.exit(res.ok ? 0 : 1);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      venue: 'jupiter',
      referralAccount: referral,
      platformFeeBps,
      error: error?.message || String(error)
    }, null, 2));
    process.exit(1);
  }
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
# Uncomment and tune only when profile is trading-agent-paper or above
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
    case 'init-pack': return cmdInitPack();
    case 'doctor': return cmdDoctor();
    case 'status': return cmdStatus();
    case 'start': return cmdStart();
    case 'config': return cmdConfig();
    case 'wallet': {
      if (process.argv[3] === 'setup') return cmdWalletSetup();
      console.log('Usage: 0xclaw wallet setup [--private-key 0x...] [--public-key ...] [--chain solana]');
      process.exit(1);
    }
    case 'test': {
      if (process.argv[3] === 'inference') return cmdTestInference();
      if (process.argv[3] === 'execution') return cmdTestExecution();
      console.log('Usage: 0xclaw test <inference|execution>');
      process.exit(1);
    }
    case 'bootstrap-openclaw': return cmdBootstrapOpenclaw();
    default:
      console.log('Usage: 0xclaw <init|init-pack|doctor|status|start|config|wallet|test|bootstrap-openclaw> ...');
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
