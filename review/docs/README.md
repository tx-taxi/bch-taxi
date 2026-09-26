# Bitcoin Cash documentation evidence

Reviewed 2026-09-26 for the BCH native explorer documentation.

## Observed gateway surface

`adapter/bch-provider.cjs` implements the documented read-only routes:

- chain tip, block-height resolution, normalized blocks, complete block transaction IDs, and 25-transaction block pages;
- transactions, output spend state, indexed CashAddr/legacy-address summaries and 25-transaction history pages;
- BCHN pending summary and observed fee values; and
- recent mining fee, reward, size, hashrate and difficulty series.

`adapter/server.cjs` accepts only GET/HEAD HTTP requests and exposes WebSocket `/api/v1/ws`. It responds to `{"action":"ping"}`, tracks one `{"track-tx":"<txid>"}`, and sends snapshot/confirmation messages during its live refresh cycle. It does not implement address tracking, Electrum, Lightning, transaction broadcast, RBF controls, or an enterprise API.

The block transaction-ID route is explicitly backed by the complete raw block ID list, rejecting incomplete or duplicate lists before returning a response.

## Chain references

Bitcoin Cash protocol documentation describes UTXO inputs and outputs, satoshi-valued transaction outputs, and optional CashToken state in outputs. It is the chain reference for the CashToken terminology used in the guide: https://documentation.cash/protocol/blockchain/transaction.html

## Scope retained in the docs

The guide states the current limitations from `explorer-manifest.json`: CashToken data is output-only raw source data; token branding, decimals and input quantities are unavailable; address pending UTXO deltas are unavailable; fiat is current USD only; and mining data is a recent indexed-block window.
