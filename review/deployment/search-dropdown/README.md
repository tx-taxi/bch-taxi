# Search dropdown continuity and icon contrast

User requested a more readable new-tab icon, followed by keeping the explorer dropdown open during an ongoing search. Shared icon color now matches Switch text, brightening on hover/focus. An opened menu stays open for input/menu interactions and active fast/probed/native lookups. Explicit Escape/toggle dismissal remains available; outside clicks dismiss when idle and navigation closes the menu.

Pending query subscriptions are counted with defer/finalize so cancellation and completion release the busy state. XMR's native search has a different shape: it has no BTC-style isTypeaheading field and uses its own adapted helper/imports. Its TypeScript check passed. Other owners' original worktrees remain untouched.

Local LTC desktop/mobile controlled delayed-response checks passed: stays open during typing and pending requests, Escape dismisses, outside clicks dismiss after completion. Readable-icon and real new-tab behavior checks also pass. Final all-chain public checks follow rollout.

## Verified public rollout

All four Coolify deployments finished. Public desktop (1440×900) and mobile (390×844) checks passed for each chain, using delayed search responses to exercise pending requests. Escape dismissal and idle outside-click dismissal passed. Icon checks verified Opened ownership, destination selection, matching Switch text color, real new-tab navigation, and viewport fit. Mobile screenshots were also inspected.

| Chain | Source commit | Coolify deployment |
| --- | --- | --- |
| BTC | 47399d99331679b1763d2e9ac639325498def833 | mbixv4ibke7cnczrtmxouwdm |
| ETH | bf923e3534fa574a1f73a5194d1a91be8f401cdd | wrz9bjmzyk5jqaakjblaigh7 |
| XMR | d672d460a32be55aa128d96412284717ea0fe71a | pgy1hghvjptu9uo5a9yktsov |
| LTC | 627329210b3616b7f2cba791782ced3fa705c6a3 | duhn3jugfn5r5gsk8ftezmcr |

Evidence: per-chain public JSON and screenshots in this directory and ../icon-color/. Behavior checks are in ../../scripts/search-dropdown-check.mjs and ../../scripts/explorer-icon-color-check.mjs. Search requests are controlled for reproducibility; these checks do not certify continuous upstream availability. Local development remains running for iteration.
