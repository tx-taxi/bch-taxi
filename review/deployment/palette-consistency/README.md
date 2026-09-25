# Native palette consistency and promotion removal

User requested preserving router black/yellow, neutral charcoal behind BTC orange, coherent ETH periwinkle, orange XMR navigation/block fills, and blue LTC flow/block accents. Subsequently explicitly authorized deployment and reiterated no uSwap anywhere.

## Reconciled references

Before editing, Coolify's latest successful deployed revisions matched the isolated source worktrees: BTC 47399d993, ETH bf923e353, XMR d672d460a, LTC 627329210. The older kit pins remain historical ancestry, already reconciled during prior integration. No intervening deployed source changes were omitted in this pass. LTC had only local evidence commits beyond production. Original owners' dirty worktrees were left untouched. Remote main revisions were checked again immediately before push and still matched.

## Implementation

- BTC: charcoal panels, navigation base, loading states and block sides; reduced search background tint. Orange fee/tile ramp and flow/block gradients; overload remains a warning color.
- ETH: periwinkle fees/block fills, periwinkle/silver transaction categories and utilization series. Categories still differ by shade; series also differ by dash style. Fiat values are accent-tinted rather than success green.
- XMR: orange active navigation, block fills, fee/tile ramp and normal incoming activity. Next-block animation varies opacity of the native color instead of flashing pink. Status indicators remain distinct.
- LTC: deployed main flow/block/fee correction was already blue. Removed the remaining hard-coded purple difficulty-hover gradient.
- Original theme retains upstream fee palettes, purple alternate fill, fiat and hover colors; it is verified separately from native defaults.
- Removed BTC/ETH promotional footer links and XMR navigation/footer links, lazy route and entire promotional page. XMR's old donation redirect returns to the explorer root. No uSwap product references remain in these frontend sources. Local browser body/link/metadata checks passed for all native sites, and the live router root also passed; no router source change was needed.

## Local evidence and limitations

BTC/ETH/XMR development builds compiled successfully. Desktop 1440x900 and mobile 390x844 root/theme round-trip/reload/transaction checks passed without page errors. Screenshots were opened and inspected, including block detail surfaces; XMR's block transaction canvas was not populated in the bounded capture, so that capture is not proof of canvas completeness. Root fee/tile colors and transaction detail rendering were observed separately.

LTC's live local provider was intermittent; `ltc-local.json` is explicitly incomplete, and its loading-state screenshots are not palette acceptance evidence. `ltc-controlled/` uses the existing recorded block/transaction fixtures and controlled fee/live messages; blue flows and default/original/reload checks passed at both sizes. `promotions-local.json` also records actual native hover stop colors on LTC/BTC/XMR. `ltc-precheck/` holds a fresh pre-rollout public controlled check confirming the earlier blue palette.

No claim of continuous provider uptime is made. Public verification after deployment is required below.

## Rollout

| Chain | Source | Coolify deployment |
| --- | --- | --- |
| BTC | a8a3bd060b79a76fc114bdd025fa64a68aca81fa | vck1dd2fnx6cbe1ljshmpylt |
| ETH | a17e3222e1b1a77d3c75d1680c9148f884574265 | jgnibvgpnukqiggg6jrn1qee |
| XMR | 3703364adacb624d6a0d12c60edd84173b408697 | jkhwcvphtu1brxw5e14uex1v |
| LTC | e9c29c2bfde8c71e7510e21b6b0cbcc8b9377e78 | k9aatsydrud04llthhxytvld |

Status: builds in progress at this checkpoint.

## Local iteration

LTC remains on http://127.0.0.1:4310 with its existing start/stop scripts. BTC, ETH and XMR development servers remain on ports 4321, 4322 and 4323 in the isolated `*-explorer-row-actions` worktrees, proxying public chain APIs. Start from each frontend directory with `node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port PORT --proxy-config .palette-proxy.json`. Sessions: BTC 54034, ETH 7389, XMR 89769; stop only those processes when finished. No backend deployment configuration or router palette was changed.

Additional local check: ETH gas-chart SVG series renders silver/periwinkle in native mode and switches back to teal under Original. Actual computed SVG stroke colors were checked; see `eth-gas-series.png` and `review/scripts/eth-series-check.mjs`.

## Public follow-up corrections

All initial deployments finished. Public promotion checks passed on all five sites. BTC desktop/mobile live confirmed transaction and theme checks passed; LTC controlled public root/flow/theme checks passed. The stricter public transaction readiness locator initially assumed a shared amount component that BTC and ETH do not render for fees; it was corrected to wait for their actual populated fee row, and confirmed transactions were selected to avoid pending-sample turnover. This was a harness issue, not a product outage.

XMR Original theme returned HTTP 404: `sync-xmr-resources.js` omitted its stylesheet from the build allowlist. Added the stylesheet and verified the actual packaged output in an isolated temporary directory. All four stylesheet URLs are now versioned to prevent returning visitors retaining stale Original-theme CSS.

Final deployment revisions (verification pending): BTC 20ee052a8 / fu75xpxrualisrlajj0jbeyp; ETH dfe5b3813 / 7q2ppgwnnpbnygwt3ejmrgz3; XMR f6a451f85 / kfzznh6lgx0vc9qtjhn2zwkl; LTC e66ca7ff4 / grhmoiqhndiyikpdepncgc8v. XMR intermediate packaging commit 60ac767a9 has deployment pxvmfqjh1p9q1ol68irfuucs.

## Verified completion

All final deployment revisions above finished successfully; see `deployments-final.json`. Public BTC/ETH/XMR desktop/mobile root, native→Original→native, refresh, and populated transaction checks passed; the native screenshots were opened and inspected. LTC public recorded-fixture desktop/mobile root, flow, and theme checks passed in `ltc-controlled/public.json`.

After all final deployments finished, `promotions-public.json` verified no uSwap text, links or metadata on all five sites, no promotional content at XMR’s old route, native difficulty hover colors, and successful loading of the versioned Original stylesheet on every native explorer. XMR public native/original mobile screenshots were visually compared: orange native navigation/fees versus upstream original colors.

Local development remains running. Final app code is deployed; this evidence-only follow-up is committed locally to avoid triggering unnecessary rebuilds. Kit decisions and production-resource/caching guidance were updated, preserving other concurrent kit work.
