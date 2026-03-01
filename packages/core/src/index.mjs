export const confidenceTiers = {
  0: 'normal',
  1: 'reweight',
  2: 'safe_mode',
  3: 'hold_observe'
};

export const fallbackOrder = [
  'primary:wallet+birdeye+lunar',
  'fallbackA:dexscreener_enriched',
  'fallbackB:agenti_geckoterminal_market_social_wallet',
  'fallbackC:safe_mode_or_hold'
];

export const defaultPolicy = {
  liveExecution: false,
  requireExplicitApproval: true,
  minNewSymbolRatio: 0.35,
  maxSymbolStalenessCycles: 6,
  targetBasketSize: 8
};
