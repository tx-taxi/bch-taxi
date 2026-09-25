# Local provider follow-up — 2026-09-25 UTC

Fixed redundant indexed-provider requests: full transaction arrays populate individual transaction cache entries; missing outspends use one Haskoin batch (at most 25 IDs); the bounded address graph reuses the same address-history fetch. Enforced the 800-entry cache bound after batch insertion.

Demonstrated behavioral gap: 25 spend lookups previously caused 25 provider requests. A mocked provider call-count check retained real spent-output fields while requiring one batch. Real address recheck populated balance, latest-100 history graph and 25 transactions with no HTTP failures (address-results.json). Real historical block500000 fetched current block transactions and outspends successfully after scrolling into the deferred list. Visible checks and screenshots record desktop/mobile rendering.

No claim that the original pre-scroll skeleton was broken: inherited @defer(on viewport) intentionally delays the transaction list. Full-page screenshots alone do not activate it.
