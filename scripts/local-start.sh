#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .local
for port in 4360 4361; do if ss -ltnH "sport = :$port" | rg -q .; then echo "Port $port occupied"; exit 1; fi; done
cp adapter/frontend-config.json frontend/mempool-frontend-config.json
(cd frontend && node generate-config.js)
nohup bash -c 'cd frontend && exec node node_modules/@angular/cli/bin/ng.js serve -c bch --host 127.0.0.1 --port 4360' > .local/frontend.log 2>&1 </dev/null & echo $! > .local/frontend.pid
nohup env PORT=4361 BCH_ROUTER_ORIGIN=http://127.0.0.1:4340 node --watch adapter/server.cjs > .local/adapter.log 2>&1 </dev/null & echo $! > .local/adapter.pid
printf 'BCH review: http://127.0.0.1:4361 (Angular watch:4360)\n'
wait
