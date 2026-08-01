#!/usr/bin/env bash
# Local, on-demand refresh of the Instagram carousel.
#
# Loads .env.instagram.local, sets up a throwaway Python venv, and runs
# fetch_instagram.py — which mirrors matching @prepfinland videos to R2 and
# rewrites public/instagram.json. Run it from a home/residential connection;
# Instagram blocks datacenter IPs (which is why this isn't a GitHub Action).
#
# Usage:  npm run fetch-instagram
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${INSTAGRAM_ENV_FILE:-.env.instagram.local}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE." >&2
  echo "Copy the template and fill in your R2 credentials:" >&2
  echo "  cp .env.instagram.example $ENV_FILE" >&2
  exit 1
fi

# Load KEY=value pairs from the env file into the environment.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

VENV="scripts/.venv"
if [[ ! -d "$VENV" ]]; then
  echo "Creating Python venv at $VENV ..."
  python3 -m venv "$VENV"
fi
# shellcheck disable=SC1091
source "$VENV/bin/activate"
pip install --quiet --upgrade pip
pip install --quiet -r scripts/requirements.txt

python scripts/fetch_instagram.py

echo
echo "Done. If public/instagram.json changed, review and commit it:"
echo "  git add public/instagram.json && git commit -m 'chore: refresh instagram videos'"
