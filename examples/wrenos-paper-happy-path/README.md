# WrenOS paper happy path

This example demonstrates an end-to-end paper-first flow:

1. discovery/research input (`sample-input.json`)
2. validation + gating (data quality tiers + backtest scorecards)
3. paper execution decision (`propose_trade_set` or `hold_observe`)
4. audit/log output (`out/paper-decision-log.json`)

## Run

```bash
node examples/wrenos-paper-happy-path/run.mjs
```

## Expected output

- console summary with final paper decision
- JSON audit log written to `examples/wrenos-paper-happy-path/out/paper-decision-log.json`

This example is deterministic (fixed input snapshot), inspectable, and file-first so operators can review every decision stage.
