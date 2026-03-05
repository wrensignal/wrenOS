# Meme Discovery Pack (`meme-discovery`)

Dual-agent meme discovery in a box.

(Architecture: research agent + trading agent. Internally this pattern originated as “Scout + Rook”.)

One-command init:

```bash
0xclaw init-pack --pack meme-discovery
```

Generates `.0xclaw/pack-meme-discovery.json` with:
- research agent config with signal sources:
  - Nansen, Dexscreener, CoinGecko, pump.fun, crypto-news, LunarCrush, Birdeye, agenti
- trading agent config with zoo-style strategy management
- handoff contract for meme watchlists
- composite scoring model weights
- default execution adapter for Jupiter + pump.fun (Jupiter referral env placeholder)
- Speakeasy inference routing (`https://api.speakeasyrelay.com`)

## Handoff schema

- `handoff/meme-watchlist.schema.json`
- channel pattern: `inbox/meme-watchlist-*.json`

## Referral env placeholders

- `JUPITER_REFERRAL_ACCOUNT`

## Notes

- Inference routes through Speakeasy.
- Trading defaults to paper mode until operators explicitly enable live execution.
