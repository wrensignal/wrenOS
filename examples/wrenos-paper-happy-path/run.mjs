import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluateDataQuality, selectPrimarySymbols } from '@wrenos/adapters/src/index.mjs';
import { summarizeLaneScorecards, buildHeartbeatPlan } from '@wrenos/loops/src/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, 'sample-input.json');
const outDir = path.join(__dirname, 'out');
const outPath = path.join(outDir, 'paper-decision-log.json');

const input = JSON.parse(await readFile(inputPath, 'utf8'));
const quality = evaluateDataQuality(input.feedQuality);
const symbols = selectPrimarySymbols({ walletFlow: input.walletFlow });

const scorecards = summarizeLaneScorecards(input.backtests);
const gatePass = (scorecards.exploit?.avgEdgeBps || 0) >= 15 && (scorecards.exploit?.worstDrawdownPct || 100) <= 20;

const decision = {
  mode: 'paper',
  action: gatePass && quality.tier <= 1 ? 'propose_trade_set' : 'hold_observe',
  reason: gatePass
    ? `gate_pass edge=${scorecards.exploit?.avgEdgeBps ?? 0}bps dd=${scorecards.exploit?.worstDrawdownPct ?? 0}%`
    : 'gate_fail'
};

const heartbeatPlan = buildHeartbeatPlan({
  confidence: quality.label,
  exploit: symbols.slice(0, 3).map((s) => s.key),
  explore: symbols.slice(3, 8).map((s) => s.key),
  tuner: { cadence: 'adaptive', gatePass }
});
heartbeatPlan.ts = input.asOf || '2026-03-07T00:00:00.000Z';

const audit = {
  ts: input.asOf || '2026-03-07T00:00:00.000Z',
  stage: {
    discovery: { walletFlowRows: input.walletFlow.length, selectedSymbols: symbols.length },
    validation: { quality, scorecards, gatePass },
    execution: decision,
    observability: { heartbeatPlan }
  }
};

await mkdir(outDir, { recursive: true });
await writeFile(outPath, JSON.stringify(audit, null, 2));
console.log(JSON.stringify({ ok: true, outPath, decision: audit.stage.execution }, null, 2));
