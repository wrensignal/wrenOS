# Contributing to 0xClaw

Thanks for contributing.

## Development setup

```bash
npm install
npm --workspace packages/cli test
npm --workspace packages/speakeasy-ai test
```

## Guidelines

- Keep changes minimal and focused.
- Update docs when behavior/config changes.
- Do not commit secrets (`.env`, `.mcp.json`, private keys).
- Preserve safe defaults (`liveExecution: false` unless explicitly required).

## Pull requests

Include in PR description:

1. What changed
2. Why it changed
3. Verification commands + output summary
4. Any operator-facing migration notes

## Vendor policy

Vendored dependencies should stay runtime-focused. Remove upstream clutter that is not required for 0xClaw operation.
