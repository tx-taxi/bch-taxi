# BCH production runtime

Build the repository-root `Dockerfile`. It builds the native Angular frontend,
then runs `node adapter/server.cjs` as the unprivileged `node` user on port 8080.
The container serves the generated frontend, resources, optional theme CSS, API,
WebSocket feed and social images; no second frontend service is required.

Required container defaults (already set in Dockerfile):

- `PORT=8080`
- `BCH_HOST=0.0.0.0`
- `BCH_STATIC_ROOT=/app/public`
- `BCH_SITE_ORIGIN=https://bch.tx.taxi`
- `BCH_ROUTER_ORIGIN=https://tx.taxi`

The production frontend deliberately uses `/local-router` as a same-origin
router API/assets gateway. In production this forwards to `BCH_ROUTER_ORIGIN`,
not the local review hub. Preserve WebSocket upgrade support for `/api/v1/ws`.
The public URL is `https://bch.tx.taxi` and the container HTTP health check is
`/healthz`. That endpoint proves process liveness; inspect `/api/provider-health`
and real API data separately when verifying upstream availability.

Optional upstream overrides are `BCH_INDEXER`, `BCH_NODE`, and `BCH_FALLBACK`.
The current implementation uses process-local shared caches and request
coalescing. It has no persistent database or writable data directory to mount.
A restart loses cached data and observed chart history. Run one replica to avoid
multiplying public-provider polling and cold-start requests.

The image includes the BCH navbar SVG read at server startup and the default
mining pool SVG used by the gateway. Generated `.theme-build` styles are copied to the static root. Mempool Original
uses `resources/mempool-original.css`; resources and config generated under
`src/resources` are copied after the Angular bundle. Production preserves the
local 128,000,000 initial block-weight capacity and 15 retained blocks; live
BCHN ABLA capacity updates remain authoritative.
