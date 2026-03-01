---
name: speakeasy
description: Private inference routing and operations via Speakeasy endpoints. Use when configuring model routing, running private inference calls, validating degraded-mode behavior, setting cost/usage logging, or integrating agents with Speakeasy-backed inference in OpenClaw workflows.
---

# Speakeasy Skill

Use this skill to standardize Speakeasy integration for research/trading agents.

## Configure

1. Require local env vars (never commit secrets):
   - `SPEAKEASY_BASE_URL`
   - `SPEAKEASY_API_KEY` (if deployment requires)
2. Route by task type:
   - `research`
   - `deep_think`
   - `codegen`
3. Keep fallback chains explicit per task.

## Operate

1. Gate expensive calls on material input change.
2. Cache deterministic calls (short TTL) to reduce duplicate spend.
3. Log usage/cost per call to local memory artifacts.
4. On route degradation:
   - downgrade cadence,
   - keep paper mode,
   - emit explicit degraded status,
   - avoid silent failure.

## Verify

1. Run preflight probe for each task route.
2. Confirm non-empty responses and model identity.
3. Confirm usage logging updated.
4. Confirm fallback route works when primary fails.

## References

- Read `references/env-and-routing.md` for env schema and routing contract.
- Read `references/degraded-mode.md` for confidence-tier behavior and fallback ladder.
- Read `references/ops-checklist.md` for runbook-style verification.
