# Vendor Skills Bundle (Scout + Rook)

This directory snapshots the skills currently used by Scout and Rook workspaces.

Source snapshot:
- `/Users/clawd/.openclaw/workspace-rook/skills`
- `/Users/clawd/.openclaw/workspace-scout/skills`

Notes:
- This is a vendored copy for portability and reproducible setup.
- Upstream skills may evolve independently.
- Re-sync intentionally when operators want newer behavior.

## ClawHub packaging

Speakeasy skill is prepared for ClawHub distribution:

```bash
openclaw skills install speakeasy
```

Packaging/publish helpers:
- Skill source: `vendor/skills/speakeasy/`
- Release notes/checklist: `vendor/skills/speakeasy/CLAW_HUB_RELEASE.md`
- Publish script: `scripts/publish-clawhub-speakeasy.sh`
