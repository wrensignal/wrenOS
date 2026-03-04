export function createExecutionAdapter(config = {}) {
  return {
    jupiter: {
      enabled: config.jupiterEnabled ?? true,
      referralAccount:
        config.jupiterReferral ||
        process.env.JUPITER_REFERRAL_ACCOUNT ||
        'B7BG7c5QkxQApQnApwkmgAhU881o6KH2Zr5o3UwX4fnc.',
      // fee token accounts: USDC + SOL + USDT created via referral.jup.ag
      platformFeeBps: config.jupiterFeeBps || 0
    },
    // pump.fun bonding curve trades — no referral available,
    // just route through vendored pump-fun-sdk-lite
    pumpfun: {
      enabled: config.pumpfunEnabled ?? true
      // no referral mechanism — trades go direct to bonding curve
    }
  };
}
