# crypto-news-lite

Runtime-focused MCP news server fork for OpenClaw workflows.

## What this repo contains
- MCP server runtime (`mcp/`)
- Research data artifacts (`archive/`, `data/`, `.data/`)
- Utility scripts (`scripts/`)

## Security notes
- No hardcoded API keys in tracked source files.
- Some utility scripts require env vars at runtime (for example `GROQ_API_KEY`, `OPENAI_API_KEY`, `KV_REST_API_TOKEN`).
- Do not post strategy details or trade specifics publicly.

## Run MCP server
```bash
cd mcp
node index.js          # stdio mode
# or
node index.js --http   # HTTP mode
```

## Useful scripts
```bash
node scripts/compute-tag-scores.js
node scripts/enrich-archive.js
node scripts/index-embeddings.js
```
