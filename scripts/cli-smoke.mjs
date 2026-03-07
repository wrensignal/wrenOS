#!/usr/bin/env node
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const cli = path.join(repoRoot, 'packages/cli/src/index.mjs');
const dir = mkdtempSync(path.join(tmpdir(), 'wrenos-cli-smoke-'));

function run(args) {
  const r = spawnSync('node', [cli, ...args], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(JSON.stringify({ ok: false, step: args.join(' '), stdout: r.stdout, stderr: r.stderr }, null, 2));
    process.exit(r.status || 1);
  }
}

run(['init', '--profile', 'research-agent']);
run(['doctor']);
run(['status']);
run(['config', 'set', 'risk.maxTradeUsd', '25']);
run(['init-pack', '--pack', 'dual-agent-pack']);
run(['bootstrap-wrenos']);
run(['start', '--once', '--interval', '1']);
run(['migrate']); // should no-op cleanly when no .0xclaw exists

console.log(JSON.stringify({ ok: true, smokeDir: dir }, null, 2));
