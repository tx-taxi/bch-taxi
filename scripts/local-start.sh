#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .local
for port in 4310 4311 4312 9332; do
  if ss -ltnH "sport = :$port" | rg -q .; then echo "Port $port is in use; use local-stop.sh only for this project's processes."; exit 1; fi
done
cp adapter/frontend-config.json frontend/mempool-frontend-config.json
(cd frontend && node generate-config.js)
nohup bash -c 'cd frontend && exec node node_modules/@angular/cli/bin/ng.js serve -c ltc --host 127.0.0.1 --port 4311' > .local/frontend.log 2>&1 < /dev/null & echo $! > .local/frontend.pid
nohup node --watch adapter/server.cjs > .local/adapter.log 2>&1 < /dev/null & echo $! > .local/adapter.pid
nohup bash -c 'cd ../ltc-router-review && exec env PORT=4312 HOST=127.0.0.1 node node_modules/tsx/dist/cli.mjs watch src/index.ts' > .local/router.log 2>&1 < /dev/null & echo $! > .local/router.pid
echo 'Local review: http://127.0.0.1:4310 (wait for frontend compilation in .local/frontend.log)'

# Keep the development supervisor attached; stop from another terminal.
wait
