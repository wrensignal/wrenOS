# Data Archive Policy

This repository is the **0xClaw core product repo**.

## Scope
Keep only:
- runtime code
- MCP/code integrations
- scripts used by runtime/release
- schema/docs needed for product operation

Do **not** store large historical datasets here.

## Why
Keeping archive payloads out of core repo avoids:
- git bloat
- slow clones and CI
- noisy diffs
- accidental coupling between product code and offline data workflows

## Approved archive locations
Use one of:
1. Object storage (S3/R2) for raw/archive payloads
2. Separate `0xclaw-data` repo (or equivalent)
3. Git LFS in a dedicated data repo if versioning is required

## Suggested data repo layout
```text
0xclaw-data/
  raw/
  normalized/
  snapshots/
  manifests/
  schemas/
```

## Manifests
For every uploaded dataset, keep a manifest with:
- dataset name/version
- source
- date range
- row/file counts
- checksum(s)
- storage URI(s)
- schema version

## Ingestion contract for core repo
If core runtime needs historical data:
- fetch via URI + manifest
- validate checksum/schema at load time
- fail closed on mismatch

## Guardrail
Before merging PRs to this repo:
- reject large data payloads and archive dumps
- keep data generation/export scripts only when they support runtime workflows
