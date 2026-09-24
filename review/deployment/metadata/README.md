# Metadata alignment review — 2026-09-24

Reference: directly fetched deployed BTC/ETH/XMR root metadata and social PNGs. `btc-reference.png` records the deployed BTC composition. `adapter/assets/README.md` records reused SVG provenance. The original LTC navy card was visually inconsistent despite correct image dimensions.

Updated root/block/transaction/address cards were rendered locally at 1200×630 and actually opened. They now retain the reference's checkerboard bands, black surface, frame, mesh, heading positions, monospace typography and logo slot, with LTC labels, existing wordmark and #345d9d accent. Native entity facts remain: block 100000 (2012-03-14), transaction fee 0.00053719 LTC and address history count. Hashes fit inside the frame. Controlled provider failure renders an explicit unavailable subtitle without fabricated facts (`unavailable.png`).

Initial HTML now agrees with the router's LTC identity, includes site/locale/image type/alt/Twitter domain fields, and retains canonical ID. Client reset defaults no longer inherit entity-specific initial metadata. `local.json` verifies initial HTML, entity hydration, navigation back to root, canonical URL, versioned image URL and no JavaScript errors. Incremental Angular build passed. Image URLs use v=2; already cached external previews may require a platform refresh.

Kit findings committed separately at 3786616 (version 0.1.1): visual metadata parity, deep-link reset checks, idle-vs-outage distinction, separate container liveness, bounded evidence, LTC-only copy exceptions and observed main-branch auto-deploy settings.

Production verification follows rollout; local evidence is not a deployment claim.

Production verification: deployment bp53qhkj4kbc4tjvfw9tzk8u finished at d0396fd0c. Public initial HTML and browser entity-to-root navigation passed at 2026-09-24T23:32:34Z (`public.json`). Public root and transaction PNGs fetched at 1200×630 and inspected; aligned composition is live. `comparison.png` records the equal-size BTC/LTC comparison.
