# agenti-lite (OpenClaw-friendly MCP Server)

Lightweight research-focused fork of Agenti for running a large crypto research MCP tool surface.

## What this repo is
- MCP server focused on research workflows
- Current callable tool surface: **329 tools**
- Startup/tool listing hardened so advertised tools match registered handlers

## Quick start

### 1) Requirements
- Node.js 18+ (recommended: Node 22)
- npm

### 2) Install
```bash
npm install
```

### 3) Build
```bash
npm run build
```

### 4) Run (stdio MCP mode; default)
```bash
node dist/index.js
```

Optional modes:
```bash
node dist/index.js --http
node dist/index.js --sse
```

---

## OpenClaw integration (recommended)

Use as a stdio MCP server command.

### Minimal command
- **command:** `node`
- **args:** `[/absolute/path/to/agenti-lite/dist/index.js]`

Example absolute path on macOS:
- `/Users/<you>/Desktop/agenti-lite/dist/index.js`

### Suggested env (optional, improves coverage)
- `COINGECKO_API_KEY`
- `LUNARCRUSH_API_KEY`
- `ETHEREUM_RPC_URL`
- `SOLANA_RPC_URL`

If unset, many tools still work but some sentiment/news/rate-limited paths may degrade.

---

## Validation

After build, validate tool registry consistency:
```bash
node scripts/validate_server_list_tools.mjs
```

Expected: no `Tool <name> not found` for any tool returned by `server_list_tools`.

---

## OpenClaw usage tips

- Prefer `server_list_tools` first to discover available tools.
- For research loops, prioritize:
  - discovery: `market_coingecko_trending`, `geckoterminal_trending_pools`, `geckoterminal_new_pools`
  - perp regime: `market_coingecko_derivatives`, `defi_get_perpetuals`, `market_get_fear_greed_current`
  - risk/tradeability: `detect_honeypot`, `detect_rug_pull_risk`, `goplus_token_security`, `get_price_impact`

---

## Attribution / license

See `NOTICE` and `LICENSE`.
This project includes code from Agenti (Apache-2.0) with modifications.

---

## OpenClaw config (ready to paste)

```json
{
  "mcpServers": {
    "agenti-lite": {
      "command": "node",
      "args": ["/Users/clawd/Desktop/agenti-lite/dist/index.js"],
      "env": {
        "ETHEREUM_RPC_URL": "https://eth.llamarpc.com",
        "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com",
        "COINGECKO_API_KEY": "",
        "LUNARCRUSH_API_KEY": ""
      }
    }
  }
}
```
