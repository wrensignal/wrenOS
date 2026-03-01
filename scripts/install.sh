#!/usr/bin/env bash
# scripts/install.sh — One-command installer for fresh 0xclaw/OpenClaw operators.
# Idempotent: safe to run multiple times on the same machine.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="node $REPO_ROOT/packages/cli/src/index.mjs"

# ── Helpers ──────────────────────────────────────────────────────────────────
info()  { echo "[install] $*"; }
ok()    { echo "[install] ✓ $*"; }
fail()  { echo "[install] ✗ $*" >&2; exit 1; }

# ── Step 1: Verify Node >= 20 ─────────────────────────────────────────────────
info "Checking Node.js version..."
if ! command -v node &>/dev/null; then
  fail "node not found. Install Node.js >= 20 from https://nodejs.org and re-run."
fi

NODE_MAJOR=$(node -e 'process.stdout.write(process.versions.node.split(".")[0])')
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js $NODE_MAJOR detected; version >= 20 required. Please upgrade."
fi
ok "Node.js $(node --version) found."

# ── Step 2: Install dependencies ─────────────────────────────────────────────
info "Running npm install..."
cd "$REPO_ROOT"
npm install --prefer-offline 2>&1 | tail -3
ok "Dependencies installed."

# ── Step 3: Doctor check ──────────────────────────────────────────────────────
info "Running doctor..."
# Doctor exits 1 on failure; the set -e will propagate that.
$CLI doctor
ok "Doctor passed."

# ── Step 4: Init profile (idempotent) ────────────────────────────────────────
CONFIG="$REPO_ROOT/.0xclaw/config.json"
if [ -f "$CONFIG" ]; then
  info "Config already exists at .0xclaw/config.json — skipping init."
else
  info "Initializing profile research-only..."
  $CLI init --profile research-only
  ok "Profile initialized."
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           0xclaw / OpenClaw — installation complete       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Check status:"
echo "       node packages/cli/src/index.mjs status"
echo ""
echo "  2. Generate OpenClaw operator templates:"
echo "       node packages/cli/src/index.mjs bootstrap-openclaw"
echo ""
echo "  3. Review docs/quickstart.md for a full walkthrough."
echo ""
echo "  liveExecution is OFF by default. Read docs/safety.md before enabling."
