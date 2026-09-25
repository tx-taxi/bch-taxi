# BCH copy correction — local

User correction supersedes the prior inline coverage notes: product UI uses standard native labels; implementation notes stay in review documentation.

Compared with current `ltc-dropdown-release` dashboard and existing native chart/address labels. Restored Transaction Fees, Pending Transactions, Incoming Transactions, Hashrate, Block Fees, Reward stats and Balance History. Removed sampling limits, adapter/node observations, coverage/backend prose, and implementation tooltips. Pending block's unsupported “10 min block target” now leaves the existing time row blank; no ETA invented. About and routed documentation no longer describe local-review plumbing. Actual token unknowns and stale/unavailable messages remain concise. Fee quantities, percentiles, serialized-byte units, real data, pending rendering and current exchange-rate qualifiers are unchanged.

Angular watch compiled successfully (bf748aa3e7d093c9,2026-09-25 04:15UTC), followed by the small About prose cleanup. Desktop1440/mobile390 actual dashboard/mining/address/About screenshots were opened and inspected; native titles fit and the pending block no longer displays the timing annotation. results.json records zero page errors and no sampled implementation-note strings. about-results.json is the final About wording follow-up. Existing provider scope and limitations remain in earlier capability/review evidence, not treated as fixed by copy removal.

Changed strip inputs: mempool-blocks.component.html and blockchain-blocks.component.html. Integrator notified to rebuild local BCH hub export from these sources. No engine regeneration, new UI, data changes, deployment or push. Gateway4361/watch4360 remain running.

Address captures replaced after explicitly waiting for the rendered Balance History heading; both desktop/mobile settled screenshots opened and show the native heading without the former sampling note. address-results.json records the bounded follow-up. No source changes after b2b2b0c21.
