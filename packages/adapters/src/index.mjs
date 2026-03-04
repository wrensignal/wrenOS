import { fallbackOrder } from '@0xclaw/core/src/index.mjs';
export { createInferenceClient } from './inference.mjs';
export { createExecutionAdapter } from './execution.mjs';
export { createTelegramAdapter } from './telegram.mjs';

export function evaluateDataQuality({ lunarCoverage = 0, lunarErrors = 0, birdeyeCoverage = 0, walletRows = 0 }) {
  const lunarOk = lunarCoverage >= 70 && lunarErrors <= 4;
  const birdOk = birdeyeCoverage >= 70;
  const walletOk = walletRows >= 10;

  if (lunarOk && birdOk && walletOk) return { tier: 0, label: 'normal', fallbackOrder };
  if ((lunarOk || birdOk) && walletOk) return { tier: 1, label: 'reweight', fallbackOrder };
  if (walletOk) return { tier: 2, label: 'safe_mode', fallbackOrder };
  return { tier: 3, label: 'hold_observe', fallbackOrder };
}

export function selectPrimarySymbols({ walletFlow = [] }) {
  return walletFlow.slice(0, 20).map((t) => ({
    key: `${t.chain}:${t.symbol}`,
    symbol: t.symbol,
    chain: t.chain
  }));
}
