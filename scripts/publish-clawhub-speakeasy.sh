#!/usr/bin/env bash
# Publish speakeasy skill to ClawHub
# Usage: bash scripts/publish-clawhub-speakeasy.sh [--dry-run]
set -euo pipefail

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="echo [DRY-RUN]"
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_DIR="$REPO_ROOT/vendor/skills/speakeasy"

SLUG="speakeasy"
NAME="Speakeasy"
VERSION="1.0.0"
TAGS="latest"
CHANGELOG="Initial ClawHub release of Speakeasy skill with speakeasy_chat, speakeasy_models, speakeasy_balance contract"

if [[ ! -f "$SKILL_DIR/SKILL.md" ]]; then
  echo "Missing SKILL.md at $SKILL_DIR"
  exit 1
fi

echo "Publishing ClawHub skill: $SLUG"
echo "Path: $SKILL_DIR"
echo "Version: $VERSION"

$DRY_RUN clawhub publish "$SKILL_DIR" \
  --slug "$SLUG" \
  --name "$NAME" \
  --version "$VERSION" \
  --tags "$TAGS" \
  --changelog "$CHANGELOG" \
  --no-input

echo "Done."
