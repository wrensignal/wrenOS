# Env and Routing Contract

## Required env
- SPEAKEASY_BASE_URL
- SPEAKEASY_API_KEY (if required)

## Task routes (recommended)
- research: lower-cost research route
- deep_think: higher-reasoning route
- codegen: coding-optimized route

## Fallback
Define ordered fallback routes per task and cap retries.

## Logging
Persist per-call fields:
- ts
- task_type
- model
- tokens (if available)
- estimated_cost (if available)
- success/failure
- latency_ms
