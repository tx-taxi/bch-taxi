#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for name in frontend adapter; do
  file=".local/$name.pid"
  if [[ -f "$file" ]]; then
    pid=$(cat "$file")
    if [[ -d "/proc/$pid" ]] && [[ "$(readlink -f "/proc/$pid/cwd")" == /home/lukee/dev/bch-taxi* ]]; then
      pkill -TERM -P "$pid" || true
      kill "$pid" || true
    fi
    rm "$file"
  fi
done
