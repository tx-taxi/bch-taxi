# LTC source reconciliation — 2026-09-24

Original kit 3497634889f3303634c192e66749641831107d5e pinned BTC fc701ad10391b08c67fb63ea490b192aa57a1562. User identified deployed BTC 6d67eec8da026056bf8fd980c438eef63d296167, eight commits ahead. Working LTC files and untracked assets were checkpointed under .local/checkpoints before reconciliation. No rebase, reset, or edits to other owners' worktrees.

| Commit | Change | LTC resolution |
|---|---|---|
| 6230e135f | Shared switcher + registry | Reused shared component/service; superseded by authorized 5a8b80091 |
| a03380e6d | Disable accelerator CTA | Applied default false; local runtime false |
| 9392f0b69 | Remove accelerator routes/modules | Ported source removals, preserved LTC unsupported-route exclusions |
| a94a6872b | Neutral labels and no accelerator promotion | Ported labels; preserved LTC documentation and units |
| 474922f53 | Selected chain search through router | Included in reused search lineage |
| f6f25b983 | Remove accelerator navigation | Ported graph/main navigation removals |
| ae51e42b0 | Detect search chain context | Included prerequisites, superseded by query-aware shared search |
| 6d67eec8d | Numeric timestamp; deterministic build | Included Number conversion and SKIP_SYNC build setting |

User relayed deployment-owner confirmation: 5a8b8009170b919719d26d0949e2a97e604640be is available for local integration; three frontend builds plus LTC/EVM checks reported passed. Router f9b5fe3 reported deployed with search-options. Frontend production verification remains pending. This is a report, not independent certification.

LTC now uses 5a8b80091 search TS/HTML/SCSS and registry service together. HTML/SCSS and registry are reused directly. Chain adaptations: native LTC identity/icon, local registry origin, LTC address encodings, block-hash lookup without BTC PoW prefix, native local routes, and existing source-chain confirmation. BTC 6d67eec8d remains the pinned visual reference in an isolated detached worktree at /home/lukee/dev/btc-ltc-visual-reference (4313); current production may change during the owner rollout.

Router dependency found in /home/lukee/dev/tx-taxi, separate clone from older /home/lukee/dev/router. Local-only checkout /home/lukee/dev/ltc-router-review at f9b5fe3 registers LTC at 127.0.0.1:4310. Production registry, DNS and deployments unchanged.

Kit correction committed as 6f9b34e: mandatory deployed-revision comparison and explicit difference reconciliation; matching-size/state visual comparison; provenance preserved.
