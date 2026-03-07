# Safety Posture

WrenOS is designed for staged rollout: research mode -> paper mode -> explicitly approved live mode.

Execution begins in paper mode by default.
Live execution requires explicit enablement.
External side effects require approvals.

## Default safety gates

- `liveExecution: false` by default in shipped profiles.
- External side effects should require explicit operator approval.
- Data-quality degradation should trigger confidence-tier fallback behavior instead of silent continuation.

## Secrets and keys

- Keep secrets in local env files / managed secret stores.
- Never commit API keys, wallet private keys, or seed material.
- Generated hot wallets are convenience bootstrap only; rotate to managed custody for serious capital.

## Wallet notes

- CLI wallet setup currently supports fast bootstrap for operator workflows.
- Treat generated wallet metadata as setup scaffolding unless verified against your target chain/tooling.
- For live capital, use a wallet flow that provides deterministic chain-valid address derivation and custody controls.

## Execution risk controls

Recommended minimum controls before enabling live execution:

1. Max trade notional limits
2. Max daily notional limits
3. Drawdown stop/halt thresholds
4. Venue health checks with fail-closed behavior
5. Explicit paper-to-live promotion checklist

## Operational checklist (pre-live)

1. `wrenos doctor` passes
2. `wrenos test inference` passes against intended endpoint
3. `wrenos test execution` passes with intended venue/referral config
4. Alerting/monitoring and runbooks are in place
5. Operator has tested rollback/kill-switch path

## Incident stance

- Prefer fail-safe degradation over forced execution.
- On feed or inference instability: reduce cadence and pause live actions.
- If settlement or signing behavior is uncertain: halt and escalate.
