# Speakeasy Ops Checklist

Before loop start:
- Env vars present
- Route preflight passes
- Usage log writable

Per heartbeat/cycle:
- Probe critical route(s)
- Confirm response + latency
- Log usage
- Apply tiered behavior on failures

On sustained degradation:
- Switch to safe_mode or hold_observe
- Emit explicit operator alert
- Keep paper mode; no live execution enablement changes
