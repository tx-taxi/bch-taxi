# Shared explorer actions — 2026-09-24

Changed only the shared search-form template/styles in each chain. Current source explorer shows plain Opened; foreign explorers have an icon-only new-tab link left of Switch. Source identity remains independent of a manually selected search destination. The icon's computed color exactly matches Switch's background, with accessible label/tooltip and noopener noreferrer.

All production builds/deployments finished:
- BTC 514178e26, deployment 8mtt6ryoxeoh8sggefyrajvi; base 7e5198447.
- ETH a1b92c4d4, deployment yaamgmfok7woryozympzrph3; base ac43e8d9f.
- XMR 736f3d6ad, deployment bukwzzznhrot3gf1qntqvuzi; base d25303a0b.
- LTC fccc57e10, deployment ylbinp7ckyy9qdrmfwrobdio; base c34e92e97 plus local verified evidence commits.

BTC/ETH/XMR used isolated worktrees fetched from their current main branches, which matched the deployed revisions before implementation. Other owners' dirty working trees were untouched.

Public checks for all four hosts passed at desktop 1440×900 and mobile 390×844: exactly one Opened row, no links on that current row, matching Switch/new-tab destinations, actual popup in a separate tab with original page retained, matching computed icon/background color, no overflow, and Opened staying on source after selecting another search destination. Screenshots were captured and inspected. See per-chain public JSON evidence.
