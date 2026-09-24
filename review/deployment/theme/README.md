# LTC data palette correction — 2026-09-24

User reported inherited purple transaction flows/block fills and green fee visuals mixed with LTC blue branding. Default mainnet gradient now uses #345d9d → #789de0. The active default fee palette, including WebGL fee tiles, uses ordered blue shades. Fiat text and normal incoming-activity color are blue. Actual warning/status colors remain distinct.

Mempool Original explicitly restores purple mainnet gradients, green fiat values and the original fee scale. ThemeService selects the blue palette on initial/default selection and restores the original fee palette for the original theme; CSS and rendered chart data follow the same selection.

Incremental Angular build passes. Desktop render and theme-switching checks passed; screenshots inspected. Verification uses recorded block/transaction fixtures and controlled fee inputs to distinguish palette behavior from intermittent live-provider availability. The verification harness had to account for the mobile hidden economy fee tier and collapsed flow diagram; skipped/loading states are not counted as passes. Final mobile and production evidence follows.

Local final pass: desktop and mobile default/original switching, refresh persistence and blue transaction gradient all pass with no page errors (`local.json`). Mobile opens the tracker first; the check now follows “See more details” to the transaction view before opening/inspecting its diagram. Both mobile renderings and the original-theme desktop rendering were opened and inspected. This is controlled palette verification, not an upstream uptime claim.
