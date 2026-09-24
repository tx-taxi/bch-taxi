# LTC production deployment — 2026-09-24

Authorized by the user after local review. Public host: https://ltc.tx.taxi.

- Private repository: https://github.com/tx-taxi/ltc-taxi, production branch `main`.
- Coolify application `ltc-taxi-private` (`azyfbztrruy9eoxscgum54ux`), project `tx-taxi`, environment `literal-staging`, server `game-1` (`40.160.19.141`), destination `coolify`. This matches the existing native BTC/ETH/XMR location; the environment name is historical and does not imply a non-public service.
- GitHub App `tx-taxi-coolify`, automatic deploy enabled, preview deploy disabled, shallow clone, Dockerfile build, container port 8080, HTTPS enforced, `/healthz` liveness check. No manual host port mapping.
- Cloudflare A record `ltc.tx.taxi` → `40.160.19.141`, proxied, automatic TTL. Created via authenticated Cloudflare API from the CLI environment because installed Wrangler has no DNS-record command. Existing records were inspected and left unchanged. ETH uses this proxied pattern; BTC/XMR currently use DNS-only records.
- Runtime follows ETH's single Node adapter + compiled static frontend pattern. Node 24 image, locked adapter dependencies, bundled fonts, unprivileged runtime. Separate checked-in production frontend profile. Production uses public HTTPS origin and tx.taxi router through a same-origin proxy; no Angular dev server or local router dependency.
- Local review continues at http://127.0.0.1:4310 with existing watch/start/stop scripts. Do not add a remote to the shared BTC worktree repository accidentally; use explicit LTC push URL: `git push https://github.com/tx-taxi/ltc-taxi.git HEAD:main` from the LTC branch, after reviewing the diff. Future standalone clones can use their ordinary origin/main.

## Observed deployment baseline

Existing BTC deployed revision 5580c48e6 (five commits newer than the prior approved search source) was reviewed and reconciled in LTC 92c32e165. Existing apps track `main`, not `master`. Initial LTC deployment `g4yxiwox5imco96rzlewmojj` built and started successfully. Router native-site registration is isolated in `/home/lukee/dev/ltc-router-production`, commit 476f9db, descended from current remote/deployed f9b5fe3; it adds only LTC metadata/explorer priority and adjusts the affected existing resolver expectation. 144 relevant router tests passed. Other owners' dirty worktrees were not modified.

## Public verification

`browser.json` covers dashboard, real transaction, historical block 100000, and indexed address: no page errors, no failed HTTP responses in this pass, no horizontal overflow; 14 received WebSocket messages. Screenshots were opened and inspected. Transaction fee and selected containing-block pointer remain correct; removed copy stays absent.

`http.json` verifies public tip/blocks, same-origin registry proxy, production config and social PNG. Requests returned 200 in 0.15–0.47 seconds during the check. Runtime config contains no review ports. Initial transaction HTML contains production HTTPS entity metadata and no localhost origin. TLS was validated normally (no insecure bypass). Public health reported fresh data and no recent failures.

Current provider limitation: three historical mining-chart endpoints (`blocks/fees/1w`, `blocks/fee-rates/1w`, `blocks/sizes-weights/1w`) still exceed the bounded request deadline. Busy-address history and pool details now respond from the deployment server. These chart failures are upstream availability limitations, not certified passes. Cached data is bounded and failures remain explicit.

Reference documentation checked: [Coolify automatic deployments](https://coolify.io/docs/applications/deployments/automatic-deployments), [Cloudflare DNS record management](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/). Actual app settings, deployment results, and public checks are the evidence for this setup.

## Deployment follow-up

The GitHub push of 65961f597 triggered deployment `wasvgfktfyneutwjgcen3chb` automatically, and it finished successfully. Router push 476f9db likewise deployed through its existing GitHub integration; the public registry and search-options response now identify LTC as first-party at ltc.tx.taxi. Public address history returned two disjoint pages of 25 transactions.

Mobile in-app block-height navigation exposed a missing canonical-link ID in server-rendered HTML. The direct-route checks had not exercised that path, and Angular logged its caught error to the console rather than a pageerror event. Restored `id="canonical"` on the generated tag. The behavior check now asserts populated block details, matching canonical URL, no error panel, and both console/page errors. It passes locally before publishing the adapter correction. Final public recheck follows rollout.

Final rollout: `a0jvd0rg2timt4voqhwv78x1` finished at app commit `3c64c9451f46d032fbcdea0dc6f5666582fbcc46`; LTC reports `running:healthy`, auto-deploy enabled. The public mobile navigation check now passes with populated historical block details, the correct canonical URL and no console/page errors. `final-status.json`, `search.json`, and mobile screenshots record this final check. These final evidence files are retained locally after rollout; no additional deployment is needed for evidence-only changes.

Router note: its public registry/search endpoints pass, while its Coolify status reports `running:unhealthy`, as it did before this task. That pre-existing aggregate health status was not changed or certified here.

Cold-load follow-up: a repeat height search before the initial WebSocket tip could be ignored by the inherited latest-height guard. Height suggestions/submission now defer existence validation to the block endpoint instead of requiring live bootstrap. Verified locally with the WebSocket deliberately held silent: height 100000 navigates and renders with the correct canonical URL and no console errors. This is a demonstrated behavior gap, not a new acceptance expansion.
