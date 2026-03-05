# ClawHub Release — `speakeasy`

## Install UX target

```bash
openclaw skills install speakeasy
```

## Exposed tools contract

- `speakeasy_chat`
- `speakeasy_models`
- `speakeasy_balance`

## Runtime requirement

- On first use, runtime auto-generates hot wallet if missing.
- Wallet is then reused for paid-path (x402) requests.

## Publish checklist

1. Validate skill docs

```bash
cd vendor/skills/speakeasy
ls -la SKILL.md references assets
```

2. Publish (requires `clawhub` CLI login)

```bash
# from repo root
bash scripts/publish-clawhub-speakeasy.sh --dry-run
bash scripts/publish-clawhub-speakeasy.sh
```

3. Verify install from clean OpenClaw profile

```bash
openclaw skills install speakeasy
openclaw skills list | grep -i speakeasy
```

4. Verify tool usage in runtime

- run `speakeasy_models`
- run `speakeasy_balance`
- run `speakeasy_chat` with a minimal prompt

## Release notes template

- Added ClawHub-packaged `speakeasy` skill
- Standardized tools: `speakeasy_chat`, `speakeasy_models`, `speakeasy_balance`
- Added first-use hot-wallet generation requirement for paid-path readiness
