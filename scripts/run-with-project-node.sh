#!/usr/bin/env bash
# Run a command with the Node version from .nvmrc (does not change your global nvm default).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_command() {
  if [ "${1:-}" = "exec" ]; then
    shift
    exec "$@"
  fi
  exec pnpm "$@"
}

CURRENT_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$CURRENT_MAJOR" -ge 22 ]; then
  run_command "$@"
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "nvm is required for this project (Node 22 from .nvmrc)."
  echo "Install nvm: https://github.com/nvm-sh/nvm"
  echo "Then in this folder: nvm install && nvm use"
  exit 1
fi

# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

if [ -f .nvmrc ]; then
  nvm install
  nvm use
fi

MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$MAJOR" -lt 22 ]; then
  echo "merns-shop needs Node 22+ in this shell (current: $(node -v))."
  echo "Run: nvm install && nvm use"
  exit 1
fi

run_command "$@"
