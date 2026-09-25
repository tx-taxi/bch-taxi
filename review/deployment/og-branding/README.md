# Chain social-card branding — 2026-09-25 UTC

User approved the existing chain-colored taxi header logos. Root cards now give these clear space without overlapping host labels or graph decoration. BTC uses orange/charcoal; ETH periwinkle; XMR orange/black; LTC blue/silver. Native entity renderers use the same approved logos. XMR no longer composites on the inherited raster background. Generic page helpers no longer restore legacy screenshots; image URLs are versioned.

## Verification

- Router TypeScript build and bounded four-card generation passed.
- All four frontend app TypeScript checks passed. BTC/ETH/LTC server syntax checks passed. XMR backend TypeScript passed with a temporary compiler mapping to the installed LTC sharp types (the shared local backend dependency tree lacked sharp); production Docker build subsequently passed with its locked dependencies.
- Local Playwright deep-link hydration and root navigation passed on ports 4321 (BTC), 4322 (ETH), 4323 (XMR), 4310 (LTC). Entity image URLs remained native; navigation home restored each root card. These dev processes remain running.
- Native card functions rendered transaction/block/address fixtures for BTC/ETH, token for ETH, and transaction/block fixtures for XMR. These are controlled sample values, not claims about live chain data. Images were opened for visual inspection.
- Public crawler HTML and returned PNGs verified for `/` and `/block/1` on all four chains. OG and Twitter images agree, use current versioned URLs, return HTTP 200 image/png, and measure 1200×630. All eight saved public images were actually opened and inspected.
- LTC's historical block sample displayed the honest unavailable-data fallback during this observation. Branding/rendering are verified; this is not evidence of historical-provider availability. No provider behavior was changed in this task.

`deployments.json` records Coolify's exact finished revisions. `public-checks.json` records production checks. `og-public.mjs`, `og-nav.mjs`, and `verify-og.cjs` are bounded verification tools, not source-pattern/change-detector tests. External social platforms may retain already-cached previews despite updated URLs.

## Baseline reconciliation

Implementation began from deployed/remote BTC 20ee052a8, ETH dfe5b3813, XMR f6a451f85, LTC e66ca7ff4 (local evidence descendant 928532768), router 476f9db. Remote heads were rechecked before push and unchanged. Original dirty explorer/router worktrees and unrelated kit router-hub work were preserved. Production authorization had already been granted by the user for these explorer changes.
