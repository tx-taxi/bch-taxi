<p align="center">
  <img src="frontend/src/resources/branding/bch-favicon.svg" width="88" height="88" alt="bch.tx.taxi logo">
</p>

<h1 align="center">Bitcoin Cash Explorer · bch.tx.taxi</h1>

<p align="center">
  A public Bitcoin Cash block and mempool explorer.<br>
  <a href="https://bch.tx.taxi">Open bch.tx.taxi</a>
</p>

## Overview

[bch.tx.taxi](https://bch.tx.taxi) is a Bitcoin Cash explorer in the [tx.taxi](https://tx.taxi) network. It combines a BCH-specific, read-only gateway with the Mempool frontend to inspect public Bitcoin Cash network data.

## Features

- Search and inspect BCH blocks, transactions, and indexed CashAddr or legacy addresses.
- View recent blocks, a bounded observed mempool sample, fee data, mining activity, and BCH-denominated values.
- Display CashToken data present on transaction outputs. Token metadata and input quantities can be unavailable and are identified as such by the gateway.
- Calculate and display BCH ASERT per-block difficulty information and the 210,000-block subsidy-halving schedule.
- Serve a read-only local API and WebSocket snapshot feed; it does not broadcast transactions.

## Development

The local review stack consists of the Angular frontend on port `4360` and the BCH adapter on port `4361`. The adapter reads public BCH data from its configured indexer, node, and price services; network access to those services is required. The tx.taxi router at `http://127.0.0.1:4340` is also needed for cross-explorer routing.

Install the checked Node.js dependencies before starting the stack:

```bash
cd frontend && npm ci
cd ../adapter && npm ci
cd ..
./scripts/local-start.sh
```

Open [http://127.0.0.1:4361](http://127.0.0.1:4361). The startup script writes local frontend configuration, starts both processes, and records logs and process IDs in `.local/`. Stop the processes it starts when the review is complete.

To make a production container image locally, Docker is required:

```bash
docker build -t bch-tx-taxi .
docker run --rm -p 8080:8080 bch-tx-taxi
```

The image serves the built frontend and adapter together. Production hosting, provider configuration, TLS, and secrets require a separate deployment review.

## Attribution and license

This repository adapts the [Mempool Open Source Project](https://github.com/mempool/mempool) for Bitcoin Cash in the tx.taxi network. Its difficulty and halving components adapt code from [BCH Explorer](https://gitlab.melroy.org/bitcoincash/bitcoin-cash-explorer). The inherited root README is retained in [UPSTREAM_README.md](UPSTREAM_README.md) for provenance.

The code is distributed under the terms in [LICENSE](LICENSE) and [COPYING.md](COPYING.md), including the GNU Affero General Public License v3 text and applicable trademark notices.

Mempool names, logos, and trademarks belong to their respective owners. bch.tx.taxi is independently operated and is not affiliated with or endorsed by Mempool Holdings S.A. de C.V.

## Links

- [Live explorer](https://bch.tx.taxi)
- [tx.taxi hub](https://tx.taxi)
- [Telegram channel](https://t.me/txtaxi)
- [Mempool upstream](https://github.com/mempool/mempool)
- [BCH Explorer source](https://gitlab.melroy.org/bitcoincash/bitcoin-cash-explorer)
